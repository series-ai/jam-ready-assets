# Mochimon: UI Kit ui

Original assets for RUN. Keep License.txt with redistributed files.

Pixel-art speech bubbles and UI icons to go with the Mochimon characters. Made with
**[Mochimon](https://w.run/run.sterf/mochimon)**, the RUN app for making your own pixel-art characters
and sprite sheets, where you can also repaint this kit in any of its palettes. The characters are in
`run-mochimon/2D/characters` and the food in `run-mochimon/2D/food`.

## Bubbles

`bubbles/<shape>-<mark>.png`: 33 bubbles, three shapes (`speech`, `thought`, `shout`), each
blank or holding a mark: `exclaim` (!), `question` (?), `exclaim-question` (!?), `dots` (...), `heart`,
`note`, `anger`, `sweat`, `zzz` and `star`.

Each bubble's `anchor` in `kit.json` is the tip of its tail, in the bubble's own pixels: put that
point just above the speaker's head and the bubble sits right.

## Icons

`icons/<name>.png`: 32 small icons: heart, star, coin, gem, key, lock, check, cross, plus, minus, right, left, down, up, play, pause, gear, home, clock, potion, sword, shield, mail, info, bag, trophy, bolt, fire, flag, pin, music, search.

## Palette

Painted in the TOKYO palette at 32 colours. Draw with nearest-neighbour filtering (no smoothing) and
scale by whole numbers only (2x, 3x, 4x) to keep the pixels square.
