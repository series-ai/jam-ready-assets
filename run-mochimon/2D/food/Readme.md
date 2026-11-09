# Mochimon: Food 2D/food

Original assets for RUN. Keep License.txt with redistributed files.

49 pixel-art sushi, sides and sweets, from the conveyor-belt sushi game Sushi Cat. Each one is
rendered fresh at four sizes (not scaled down from one picture), plus a turntable of it turning a full
circle. Made with **[Mochimon](https://w.run/run.sterf/mochimon)**, the RUN app for making your own
pixel-art characters and sprite sheets. Its characters are in the sister pack `run-mochimon/2D/characters`,
and its bubbles and icons in `run-mochimon/ui`.

## Files

Every item has its own folder, `<item>/`:

| File | Size | What |
|---|---|---|
| `<item>.png` | 36 x 27 | the normal size, a piece on a plate or a counter |
| `<item>-small.png` | 19 x 14 | small, for a belt, an order bubble or a list |
| `<item>-tiny.png` | 13 x 9 | tiny, for a ticket or an icon |
| `<item>-big.png` | 112 x 84 | big, for a menu, a recipe card or a close-up |
| `<item>-turntable.png` | 8 frames of 112 x 84, one row | the big size turning a full circle, 45 degrees a frame; frame 0 is `<item>-big.png` |

Every picture sits on the bottom-centre of its frame, so pieces line up on a shelf. In a turntable the
piece's centre stays on the same spot in every frame. Play it as a loop at any speed (8 to 12 frames a
second looks good). `food.json` lists the items, sizes and the turntable's frame size.

## Items

tuna, salmon, shrimp, tamago, kappa, ikura, onigiri, unagi, tako, avocado, hotate, tekka, futo, cali, ebi-ten, spider, rainbow, eel-roll, avo-roll, volcano, temaki, wheel, miso, edamame, gyoza, hamachi, tai, saba, ika, uni, oyster, prawn, tartare, rice-bowl, sake, taiyaki, dorayaki, matcha-ice, roll-cake, dango, daifuku, shortcake, purin, salmon-avo, spicy-tuna, philly, tamago-kyu, rainbow-cut, otoro.

## Palette

Painted in the TOKYO palette at 32 colours: outline `#22181c`, with ramps for rice, fish,
nori, greens and sweets. Draw with nearest-neighbour filtering (no smoothing) and scale by whole numbers
only (2x, 3x, 4x) to keep the pixels square.
