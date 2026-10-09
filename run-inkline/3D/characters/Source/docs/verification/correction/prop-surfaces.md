# Prop surface correction

## Diagnosis

The prop source placed orange parts on the same surface as another part. The
main cases were orange toe boards, face plates, caps, plugs, and bands. Several
orange torus collars also used a major radius that was equal to, or smaller
than, the host cylinder radius after the torus thickness was included.

The baseline GLB scan found 153 orange-involved near-coplanar triangle
overlaps in 26 files. It found no GLB parse errors. The baseline files were
generated before this source correction.

## Source correction

The changes are local to `scripts/blender/props.py`. They keep model IDs,
builder counts, attachment axes, and mesh primitive counts unchanged.

Orange box, cap, plug, and emitter builders now use a small clearance or an
outward move:

- `build_balance_beam`, `build_electrical_panel_wall`, `build_hammer_war`,
  `build_loading_platform_ramp`, `build_pallet`, `build_platform_grated`,
  `build_platform_high`, `build_platform_low`, `build_platform_staging`,
  `build_plyo_box_low`, `build_rooftop_gap_plank`, `build_scrap_sheet_metal`,
  `build_sci_fi_rifle`, `build_street_lamp`, `build_walkway_bridge_narrow`,
  `build_walkway_landing`, `build_walkway_ramp`, `build_work_light_stand`,
  `build_barrier_traffic_cone`, `build_crate`, `build_crate_heavy_wooden`,
  `build_machine_hydraulic_press`, `build_traffic_light`, and
  `build_utility_panel_double`.

Orange rings, bands, and collars now clear their host skin:

- `build_staff`, `build_bat`, `build_bicycle_rack`, `build_vault_rail`,
  `build_monkey_bars`, `build_climbing_rope`, `build_tire_obstacle`,
  `build_soccer_ball`, `build_volleyball`, `build_tennis_ball`,
  `build_bowling_pin`, `build_bowling_ball`, `build_punching_bag`,
  `build_door_frame_roll`, `build_pipe_straight`, `build_pipe_short`,
  `build_pipe_long`, `build_pipe_elbow`, `build_pipe_tee`, `build_pipe_cross`,
  `build_pipe_riser`, `build_pipe_manifold`, `build_pipe_vertical_elbow`,
  `build_pipe_flange_pair`, `build_pipe_inspection_port`,
  `build_cable_spool`, `build_cable_spool_metal`, `build_barrel_toxic`,
  `build_barrel_stack`, `build_bollard`, `build_bollard_retractable`,
  `build_bollard_heavy`, `build_duct_exhaust_hood`, `build_roof_turbine_vent`,
  `build_turbine_housing`, `build_roof_service_vent_stack`,
  `build_roof_drain_scupper`, `build_tank_vertical`, `build_tank_horizontal`,
  `build_tank_silo`, `build_tank_spherical`, and
  `build_utility_meter_pedestal`.

Surface caps that shared a plane now have a 1–5 mm axial clearance. Rings use
an outer radius that leaves at least a small radial gap after torus thickness.
The changes do not use runtime depth bias.

## CPU check

Run this command after prop GLB generation:

```sh
python3 scripts/verify-prop-surfaces.py \
  --props-dir public/assets/props \
  --json docs/verification/correction/prop-surfaces.json \
  --markdown docs/verification/correction/prop-surfaces-report.md
```

The default check reads each GLB. It transforms every triangle into scene
space. It compares differently colored triangles when one uses
`InkMat_SafetyOrange`. It uses an AABB sweep, normal alignment, plane gap, and
2D triangle clipping. The clipping test detects partial projected overlap. It
does not require matching triangle indices or matching triangle hashes.

The check covers one GLB at a time. It does not cover curved contact, volume
intersections, edge-only contact, cross-file placement, renderer depth
precision, or camera artifacts. Use `--all-materials` for a broad audit. That
mode also reports many intentional structural seams.

The source worker did not regenerate GLBs. The generated report is the proof
for the corrected assets.
