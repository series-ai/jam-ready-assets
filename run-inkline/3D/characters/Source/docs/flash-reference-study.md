# Flash reference study

Reviewed on 25 September 2026. These sources guide the art decisions below. The pack uses original geometry, poses, and effects. Reference footage is not included in the asset license or export.

## Main references

| Reference | Observation from the sampled material | Decision for INKLINE |
| --- | --- | --- |
| [Xiao Xiao No. 3 — Zhu](https://www.newgrounds.com/portal/view/15849) | Solid figures read against thin building lines. Round heads sit close to the arm branch. Bent limbs and broad stance changes remain clear at a small size. | Use this as the main body and environment reference. Shorten the visible neck. Keep hands and feet as rounded stroke ends. Give the figure more contrast than the level. |
| [SHOCK 1, 2, 3 — Terkoiz, hosted by Hyun's Dojo](https://www.youtube.com/watch?v=MoDGzRa1LW0) | The sampled opening uses strong black figures, a clear accent figure, and light industrial surfaces. Direction changes and open action space explain the fight. | Use this for combat staging and timing. Keep impact poses clear. Use short strike transitions, small marks at contact, recoil, and a measured recovery. |
| [Animator vs. Animation — Alan Becker](https://www.newgrounds.com/portal/view/316541) | A very simple body can express intent through the whole pose. The figure interacts with clearly defined objects and boundaries. | Use gesture and stance to show a role. Keep the face blank. Make the head, torso, and guard respond together. |
| [Stick War — CRAZY-King-JAY and whiting39](https://www.newgrounds.com/portal/view/509310) | The original game presents units through large, functional equipment shapes. Its title figure reads through the spear, shield, and helmet. | Use one clear equipment cue for a role. Keep that cue large enough to read. Avoid small decorative bands that add cost without changing the outline. |

The observations are art judgments from browser samples. They are not claims that every frame of every film was reviewed. Later SHOCK seeking failed in the player. Its opening sample and source credits remained available.

## Character direction

The prior generator changed overall height and stroke width, but reused most body landmarks. Some descriptions claimed long legs without distinct leg ratios. That was a structural fault in the variation system.

Use six body families and twelve role variants. Measure every family at a common scale. Use the same 18-bone contract and 85 clip names. Keep the role data in `src/runtime/roles.ts` and export it as `character-roles.json`.

| Family | Roles | Shape and action |
| --- | --- | --- |
| Balanced | Core, Agent | Balanced reach. Core uses an open guard. Agent uses a compact weapon stance. |
| Swift | Runner, Scout | Longer legs and a shorter torso. Runner leans into travel. Scout keeps a low ready pose. |
| Compact | Scrapper, Acrobat | Low body center. Scrapper uses close contact. Acrobat uses open arm and leg shapes. |
| Reach | Staff Adept, Duelist | Long reach. Staff Adept uses broad weapon arcs. Duelist uses an offset guard. |
| Power | Heavy, Worker | Strong stroke, short neck, and planted base. Worker has a small functional utility kit. |
| Guard | Striker, Sentinel | Strong leg or forearm emphasis. Striker uses high kick poses. Sentinel carries a shield. |

Body selection and equipment selection remain separate controls. The role kit button applies a complete starting setup. Users can then edit each part.

## Quality checks

- Compare front, side, and three-quarter views at a common scale.
- Compare preparation, contact, and recovery without effects.
- Check all 85 clips on each body. Check floor contact after proportion changes.
- Check equipment grip on the long-arm and compact bodies.
- Check the black and pale avatar colors on a phone-size stage.
- Review actual normal-speed footage before accepting the result.

[Study 04](reference/study-04-characters.png) is a generated concept benchmark. It is not a render of the delivered meshes. The character family sheet and video show the real assets.

## Implemented checks

The Swift bodies now use more leg length than the Balanced body. The generator uses shared mesh and bone landmarks. Role-specific idle and guard offsets change the resting pose. Held weapons use solid dark shapes. The worker has a separate wrench asset. The staff uses a low resting grip and a slight outward tilt.

A final mesh review found a limb tube frame fault. Adjacent rings could use opposite axes near an ankle or elbow. The generator now carries each ring basis into the next ring. Cap rings reuse the same basis. A frame-continuity assertion rejects this fault during generation.

The [base body sheet](reference/body-family.png) and [equipped role sheet](reference/character-family.png) are actual renders from the delivered GLB files.
