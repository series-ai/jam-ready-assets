# Stick Fight motion study

Reviewed from the [official Landfall page](https://landfall.se/stickfightthegame), its [teaser](https://www.youtube.com/watch?v=PsEZ81-UqDU), and the [official release trailer](https://www.youtube.com/watch?v=YBlEslDQSEQ). The normal-speed release sample covers 11.9–37.4 seconds. Local reference captures are excluded from the asset export.

## Observed techniques

| Release time | Observation | Use in INKLINE |
| --- | --- | --- |
| 11.9–16.4 s | Bodies travel far after contact. Bent limbs and body rotation show the direction. Small white contact marks stay near the cause. | Give confirmed hits a clear displacement and recovery. Keep the contact mark short. Use a shaped recovery for training targets. |
| 17.9–19.4 s | Bright platform tops separate the play surface from the dark background. Open space separates figures. | Keep our light floors and quiet backgrounds. Use open action space in the demo composition. |
| 20.9–23.9 s | A thin aim line and a long gun make direction readable before the shot. | Use tool-specific reach and a visible motion path. Keep the effect aligned with the actual tool. |
| 25.4–26.9 s | Airborne bodies form different shapes from grounded bodies. The moving figure has space around it. | Use split knees, opposing arms, and a clear travel arc. |
| 28.4–32.9 s | A hanging weight and rotating platforms make the environment respond. Large moving forms stay simple. | Use bounded object reactions where they help the demonstration. Keep secondary movement out of the main figure silhouette. |
| 34.4–37.4 s | Broken platforms use a few large fragments. Debris explains the changed level shape. | Prefer a few readable pieces and short dust over dense particle clouds. |

## Design choices for our pack

These are our implementation choices, not claims about the source code of Stick Fight. Keep the original paper, ink, and orange palette. Use authored clips with bounded reaction motion. Use short ribbons sampled from a limb or weapon. Keep camera motion small. A full ragdoll simulation would add cost and change the shared rig contract.

The footage shows broad motion clearly. It does not establish exact hit-stop duration, input buffering, or internal physics settings. Those values need tests in our own runtime.
