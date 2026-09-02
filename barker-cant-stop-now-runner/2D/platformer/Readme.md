# Cant Stop Now — Runner pack (by Barker)

Side-scrolling runner art, painted cartoon style, daytime palette.

- `character_run.png` + `character_run.json` — 12 round runner characters on one
  sheet (json lists each character's frame rect; sized against an 84x96-unit body)
- `coin.png` + `coin.json` — 10-frame coin spin sheet (256px cells);
  `coin_static.png` is frame 1 trimmed for a non-animated coin
- `crate.png` — stackable 110-unit crate; `spike.png` — single spike unit, tile into strips
- Background layers (parallax, tile horizontally):
  `city_bg1.png` (skyline; rows above y=260 are opaque black — crop or sink below
  the horizon), `hills_bg1.png` (+ `hills_tile1.png`, skirt cropped so mounds sit
  on the ground line), `ground_strip1.png` (+ `ground_tile1.png`, cropped with a
  30px grass-tuft band above the walking surface), `cloud.png`
