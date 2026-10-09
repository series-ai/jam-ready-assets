# Weapon alignment review

Date: 2026-09-26. Reviewer: Astra. Scope: local source and exported GLB pose calculations. No runtime files changed.

## Decision

Keep the existing blade and shield mounts. Keep the staff contact calibration separate. No additional mount correction is justified by this check.

The blade clips use hand rotations authored for the existing block reference. A new global blade reference changes every blade clip. A reference that corrects one thrust does not correct both thrusts. It can also move the overhead strike out of its accepted contact region.

## Method

The check loaded all 12 current character GLBs and the sword or riot shield GLB with `GLTFLoader`. It called the current `mountEquipment()` with manifest animation metadata. `AnimationMixer` sampled the exact contact times. World matrices supplied the weapon axes and tip positions.

Two temporary sword mount rotations were tested in memory. Each used the inverse contact hand rotation and a 90-degree X rotation. The reference clip was either `sword-lunge` or `sword-thrust`. This is the proposed staff-style calibration. These rotations were not saved.

The overhead check used the existing conditions in `scripts/verify-contact-poses.ts`: forward reach, tip height between 20% and 80% of body height, and a descent of more than 0.35 m from the pose 0.2 seconds before contact.

## Blade result

| Mount reference | Lunge angle from forward | Thrust angle from forward | Overhead angle from forward | Overhead failures |
| --- | ---: | ---: | ---: | --- |
| Current block reference | 4.38–38.61 degrees | 20.29–39.94 degrees | 6.84–32.66 degrees | None |
| Lunge contact | Less than 0.001 degrees | 29.34–29.38 degrees | 31.15–35.50 degrees | Standard, Compact |
| Thrust contact | 29.34–29.38 degrees | Less than 0.001 degrees | 40.11–43.17 degrees | None |

For Standard, the lunge reference raises the overhead contact tip from 0.753 m to 1.448 m. The overhead blade angle changes from 6.84 degrees to 35.50 degrees. This is a measured regression against the existing overhead check.

The source applies role offsets to `block`. The blade contact clips retain their authored hand rotations. This explains the body variation in the existing mount. The difference between lunge and thrust also remains after either new contact calibration. One global mount cannot remove that clip difference.

## Contact distance check

A second calculation placed the Fighter target chest on the actor's forward center line. It sampled root separation from 0.45 m to 2.18 m in 0.01 m steps. It used the current nearest weapon point and the runtime contact tolerance of 0.5 m. It did not simulate scene obstacles, movement, or a full attack.

| Clip | Nearest chest distance across bodies | Largest accepted separation across bodies |
| --- | ---: | ---: |
| Sword Lunge | 0.011–0.247 m | 1.32–2.18 m |
| Sword Thrust | 0.380–0.485 m | 0.60–0.85 m |
| Sword Overhead | 0.007–0.484 m | 1.30–1.68 m |
| Shield Bash | 0.236–0.349 m | 0.90–1.03 m |
| Shield Push | 0.238–0.345 m | 0.89–1.03 m |
| Shield Slam | 0.219–0.362 m | 0.85–1.09 m |

Every body had an accepted center-line distance for each listed strike. Sword Thrust has a shorter contact range. It is not selected by the current `combatMove()` sword sequence. This result does not support a global mount change.

Shield Block on Tall missed the fixed Fighter chest by 0.514 m. Shield Block is a defensive preview clip. The shield combat sequence selects Bash, Push, and Slam. All three had an accepted contact distance on every body. The shield face remains forward in these poses. No shield mount correction is required.

## Evidence and limits

The saved axis evidence is `animation-review/weapon-axis-all-bodies.json`. The comparison above used the current GLBs and runtime helpers in a read-only Node process. It produced console output only. The existing contact acceptance conditions come from `scripts/verify-contact-poses.ts`. The clip selection comes from `src/runtime/presentation.ts`. The authored wrist changes and block role offsets are in `scripts/blender/characters.py`.

This check assesses pose geometry. It does not replace visual playback, scene contact checks, or device performance validation.
