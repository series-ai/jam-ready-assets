# Figure correction diagnosis

Read-only inspection: 27 September 2026. No generator or asset changes.

## Evidence

Reviewed `scripts/blender/characters.py`, the two local kinetic studies,
`src/runtime/assets.ts`, and these actual asset sheets:

- `public/review/body-family.png`
- `public/review/character-family.png`
- `docs/verification/kinetic/animation-review/kinetic-contact-overview.png`
- `docs/verification/kinetic/animation-review/kinetic-review-01.png`
- `docs/verification/kinetic/animation-review/unarmed-review-overview.png`
- `docs/verification/expansion/animation-expansion-side-contact-overview.png`

The sheets show a lateral bar at each shoulder and hip. Several arm shapes
make a narrow rectangle around the spine. Sword contact poses hide the hand
or blade in the body from the main view. The role sheet changes figure scale
between cells. This makes the tall Staff Adept look smaller than the Core.

## Specific causes

1. `character_landmarks` puts arm roots at half the shoulder width and leg
   roots at half the hip width. Shoulder widths are 0.14–0.24 m. Hip widths
   are 0.15–0.22 m before the leg spread factor.
2. `build_character_mesh` draws a tube from the spine to each offset root.
   The arm path starts with two points at the same height. The leg path does
   the same. These are actual horizontal bars. Smooth shading cannot remove
   this shape. See the arm path near line 705 and leg path near line 722.
3. The tubes use separate rings with mixed bone weights. There is no shared
   surface at the spine branch. At bends, linear skin weights can narrow a
   ring or make a triangular join. There is only one mixed ring at each
   elbow and knee. The tube has straight sections between rings.
4. Belts, collars, and the Sentinel mantle add visible body width. They can
   restore the unwanted shoulder and hip shape after the bars are removed.
5. `_patch_authored_frame` accepts bone rotations only. Several calls in
   `apply_kinetic_pose_overrides` put lift-like values in `Hips=(...)`.
   For example, `jump-loop` uses `(0, 0, 0.18)`. The function converts this
   to a 0.18-degree rotation. It does not change the separate hip position
   tuple. The code and comments therefore describe different changes.
6. The timing policy applies to 23 clips only. Eight use linear curves.
   `punch-left`, `punch-right`, `punch-heavy`, `kick-front`, and
   `kick-roundhouse` are absent from that set. These use Blender's default
   key interpolation. A one-frame near-hold does not fix a slow lead-in or
   define a fast strike path.
7. Every resolved bone receives keys at the same times. Sparse overrides
   carry earlier values forward. This helps completeness, but it does not
   define separate lead, strike, follow-through, and settle timing.
8. `bake_character_contact` moves the whole body up or down until the lowest
   mesh point meets the floor. It does not hold a support foot in place.
   It can also use a hand or weapon-side limb as the lowest point.
9. Equipment rotation comes from a sampled reference pose. Weapon hand
   angles were then tuned to that rotation. A rig change can change this
   basis. Only rifle and shotgun clips use the support-hand solver. Staff
   and sword clips do not have a support-grip contract.

## Exported motion probe

A CPU-only Three.js probe loaded the current `stick-standard.glb`. It sampled
13 equal times per clip. Each value below is the total world-space range of
the `Foot_L` bone origin. The origin is at the ankle, not the toe surface.
These values establish motion. They do not measure mesh penetration.

| Clip | X range | Y range | Z range |
| --- | ---: | ---: | ---: |
| idle | 0.013 m | 0.012 m | 0.098 m |
| punch-right | 0.096 m | 0.033 m | 0.288 m |
| punch-heavy | 0.374 m | 0.028 m | 0.379 m |
| kick-front | 0.123 m | 0.042 m | 0.305 m |
| sword-slash | 0.091 m | 0.002 m | 0.224 m |

The sword support foot stays almost level while it moves more than 0.22 m
in depth. The existing floor test can pass during this motion. A successful
floor test is therefore not evidence of a planted foot.

## Proposed original figure

Use one narrow spine stroke. Give both arms one common root on this stroke.
Give both legs one common root at its lower end. Keep a round head. Keep
nearly equal line widths through each limb. Use round stroke ends. Remove
the side branch bars, mantle, collar, and belt from the base body.

Keep the 18 internal bone names. Put the actual arm and thigh bone origins
at the common nodes. Keep small stance offsets in elbow, knee, and ankle
positions as separate data. Do not derive these positions from body width.
Use body height, limb ratios, line width, and pose to separate the roles.

A mesh-only change is cheaper but leaves offset motion pivots. Its arm roots
can still spread during movement. A runtime line renderer would need a new
export contract. The centered rig and tube mesh are the best fit for this
pack. A center-root rig needs a small export test before the full build.

## Ranked work

| Rank | Change | Benefit | Cost and risk |
| --- | --- | --- | --- |
| 1 | Center the arm and leg roots. Remove lateral branch segments and body-width accents. | Directly fixes the rejected figure shape. | Medium. Bone bases and equipment poses need review. |
| 2 | Fix the pose data boundary. Give hip translation its own argument. Give each action explicit phases. | Removes silent unit errors. Makes timing review possible. | Low to medium. Preserve contact event times unless all consumers change together. |
| 3 | Re-author idle, run, punch-right, punch-heavy, kick-front, sword-slash, sword-overhead, and staff-thrust first. | These clips cover the most visible motion and tool failures. | Medium. Check the actual 1x motion after each small group. |
| 4 | Bake a support-foot target during planted phases. Solve the leg after the body path. | Removes sliding and gives body motion a support point. | Medium to high. Needs foot phase data and knee direction. |
| 5 | Use explicit grip position and rotation data. Add an optional support grip per action. | Makes equipment behavior survive body changes. | Medium. Preserve authored hand release phases. |
| 6 | Use one body scale and one floor reference in body and role sheets. | Makes proportions and contact easier to judge. | Low. Keep separate action framing for large weapons. |

For the first motion group, use a 2–4 frame load, a 1–2 frame fast strike,
a 2-frame contact shape, and a slower 5–9 frame recovery at 30 FPS. These
are starting values for original animation, not measurements from the study.
Use different timing for heavy actions. Define an arc for the striking hand
or weapon tip. Lead the body with the hip position, then the upper spine,
then the hand. Give the free arm a different shape and timing. Keep enough
space between limbs in the side and main views.

Do not make the whole clip linear. Use fast spacing before contact, a real
hold, and a curved recovery. Keep the 120 Hz export for contact accuracy.
The export rate does not need to define the visible animation style.

## Acceptance evidence

- Front, side, and three-quarter views show one common arm node and one
  common leg node. No horizontal shoulder or hip bar remains.
- Each body keeps the round head and continuous narrow limbs during bends.
- The support foot moves less than 0.015 m during each declared plant phase.
- The knee stays on its intended side of the support line.
- The contact pose reads at the actual phone display size without effects.
- The weapon grip stays in the hand through preparation, contact, and return.
- The normal-speed clip shows separate load, strike, hold, and recovery.
- New sheets identify the artifact version and use the new GLBs.

The first check should use one centered Core body, one large body, and the
eight key clips. The final pass must also sample all retained clips. Changing
the bind pose can expose faults in clips outside the key group.
