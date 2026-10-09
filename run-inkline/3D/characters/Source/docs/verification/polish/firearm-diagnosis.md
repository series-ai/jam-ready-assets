# Rifle and shotgun diagnosis — 1.4.0

The main faults are the mounted pose, recoil direction, and support-hand target. The meshes read as a rifle and a shotgun. A full mesh replacement is not needed.

## Evidence and scope

Read `src/runtime/assets.ts`, the firearm builders in `scripts/blender/props.py`, and the ranged poses in `scripts/blender/characters.py`. Inspected `final-combat-triage-4.png` and three source-film frames in `firearm-film-review.png`. The latter frames show rifle idle at 0.033 s, rifle fire at 0.117 s, and shotgun fire at 0.117 s. These are saved final 1.4.0 recordings with actual mounted props. They are timed stills, not continuous playback.

Loaded the current standard GLB and both prop GLBs on the CPU. Called the production `mountEquipment` and `supportEquipment` functions. Measured exact action times. `firearm-diagnosis-metrics.json` contains the results and hashes. No browser, GPU, or source edits were used.

## Required corrections

1. **Seat the stocks at the common arm junction.** At rifle-idle, the rifle stock butt is 172 mm from that junction. Its offset is 164 mm sideways, 15 mm up, and 51 mm back. The shotgun is also 172 mm away. The side view hides much of this error. The front view shows the weapon and folded arms off to one side. The mount cancels the reference-hand rotation but has no stock contact constraint. Correct the right-arm pose and hand orientation together. Do not move the weapon away from its right-hand grip to hide this error.

2. **Reduce the sideways and upward recoil.** At the authored 0.100 s shot event, the rifle barrel is 12.7° up and 5.9° sideways. The shotgun is 41.0° up and 16.9° sideways. At 0.200 s, the shotgun still points 24.6° up. The saved frames show this large lift. It reads as raising the gun, not a short recoil. Keep the barrel close to its aim at the event. Put a small backward move and upward rotation after the event. Keep the stock near the arm junction. Remove most of the sideways sweep.

3. **Put the shotgun support hand on the pump, then let it move.** The current shared target fixes the palm at local `[0, -0.015, 0.19]`. The modeled pump spans local Z=0.28–0.40 m. The palm therefore holds at least 90 mm behind the pump. The solver also overrides the authored pump-hand frames at 0.500–0.633 s. A pump motion cannot survive this fixed target. Use a shotgun target on the pump and a short rearward target motion during the pump phase.

4. **Keep support contact at both reload boundaries.** At rifle-reload start and end, the left palm is about 94 mm from the foregrip. The solver is disabled for the entire reload. It is enabled in rifle-idle. This creates a hand-position discontinuity between those states. Blend support contact out after reload starts and back in before reload ends, or author exact matching endpoint poses. Do not keep the hand locked during the reload itself.

## Small correction proposal

First correct the stock and right-hand relationship in the shared rifle pose. Preserve the simple body and its common arm junction. Keep the rifle mesh dimensions unless the corrected pose proves that they need adjustment.

The shotgun needs a reach correction as well. The standard upper arm and forearm total 0.5039 m. The palm offset adds about 0.04 m. A seated 0.29 m stock and the 0.34 m pump center require about 0.63 m of forward reach. A target change alone cannot solve this. Shorten the stock or use a mounted scale near 0.80–0.85, then check the actual grip reach. This range is a proposed starting point, not a measured final solution. Retain enough elbow bend for clear line separation. Check all body variants before choosing the final size.

Then revise the rifle and shotgun shot keys. Use a short backward recoil and a modest upward recoil after the shot. Add a moving shotgun pump target. Match rifle reload support contact at its boundaries. These changes address the current faults without a general weapon-system rewrite.

## Acceptance proposal

- Inspect idle, exact shot event, peak recoil, return, reload ends, and pump phases from side, front, and three-quarter views.
- Keep the stock within about 30 mm of the common arm junction in idle and within about 40 mm during recoil. These are proposed style limits.
- At the shot event, keep aim within about 5° of the intended direction. Put the recoil peak after the event. Start with peaks below about 8° for rifle and 15° for shotgun, with little sideways motion. These are proposed style limits.
- Keep both palms on their intended grip surfaces. Make the shotgun palm follow the modeled pump location. Do not stretch the arm or hide an unreachable target with a different grip.
- Keep the reload endpoint palm error below 10 mm and show a continuous hand release and return.
- Verify the minimum arm-reach margin across all 12 bodies. Then inspect the final phone-scale silhouette.

The previous 288 grip checks cover melee equipment. They do not test firearm stock seating, barrel aim, pump contact, or reload continuity. Their pass result does not close these faults. This focused review supersedes the broad prior no-blocker statement for rifle and shotgun poses.

## Source receipt

- Runtime assets SHA-256: `d66fdb9a58b2ccac49c7c398db3120314bffa0e0098c9f74e239901c57dd4e51`
- Standard body SHA-256: `8e24371d14a39641c1b19edc6134eefb2bf97b91931eeab8bed76114a5933a15`
- Prop and authoring hashes: `firearm-diagnosis-metrics.json`.
