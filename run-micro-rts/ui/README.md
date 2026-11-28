# RUN Micro-RTS — RTS UI & HUD Chrome

Native pixel-art RTS UI chrome designed to pair with `run-micro-rts/2D/space-scifi` at exact `8×8` grid scale.

## Contents

- `selection-rings/` — 4 footprint tiers (`sel-sm`, `sel-md`, `sel-lg`, `sel-bldg`), each a 4-column strip for `selected`, `hover`, `enemy`, and `ally` states in 3/4 RTS ellipse perspective.
- `cursors/` — 8 tactical cursors (pointer, attack, move, gather, repair, patrol, ability AOE, invalid) in 1–2 frame strips.
- `markers/` — 5 in-world order and placement markers (move ping, attack ping, animated rally flag, valid/blocked `8×8` build grid tiles).
- `icons/` — 12 HUD resource and command card icons (minerals, rich gold, plasma gas, supply, move, stop, hold, attack, patrol, build, repair, rally).
- `ui-manifest.json` — Cell dimensions, frame counts, and relative file paths for every UI strip.
