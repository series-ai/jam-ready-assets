---
pretty_name: Pixel Art Atlas — 1.4M Synthetic Sprites
license: cc0-1.0
language:
- en
task_categories:
- text-to-image
size_categories:
- 1M<n<10M
tags:
- pixel-art
- sprites
- synthetic
- ai-generated
configs:
- config_name: default
  data_files:
  - split: train
    path: data/train-*.parquet
  - split: validation
    path: data/validation-*.parquet
---

# Pixel Art Atlas · 1.4M Synthetic Sprites

![Pixel Art Atlas banner with gold pixel lettering and two rows of colorful sprites on a dark background.](banner.png)

1,409,404 synthetic game sprites with English captions, covering 6,194 training subjects. Each sprite is a native 16×16 image with a transparent background. The images were generated from text prompts with Krea 2 Turbo and a pixel art LoRA.

**Caption quality:** Captions generally describe what the generator was asked to draw. Image–caption agreement has not been systematically reviewed. For example, a sprite may show a lit candle even when its caption says "unlit". Colours, materials, counts and other details may also differ. Treat captions as approximate labels. Check the images yourself before using the captions to score how well a model follows instructions.

The source contained 1,412,908 sprites. Filtering removed 3,504 training examples and retained 1,405,308 training sprites and 4,096 validation sprites. Some captions were corrected during filtering. The split is inherited from the training project; it does not establish that validation subjects are unseen in training.

## Files

Use the Parquet files to load individual sprites as RGBA images. Each example has four fields: `image`, `caption`, `subject` and `row_id`. The banner shows selected examples; it is not a random quality sample.

```python
from datasets import load_dataset

rows = load_dataset("Angais/pixel-art-atlas-1.4m", split="train", streaming=True)
example = next(iter(rows))
print(example["caption"], example["image"].size)  # native 16 × 16
```

Extract the ZIP to a single directory. `tokens.npy` contains 256 palette indices per row, in row-major order. Index zero is transparent; other indices select RGB colours from `palette.npy`. `captions.json` and `objects.json` are parallel lists of captions and subject labels. `split.npy` encodes the partition (0 = training, 1 = validation).

```python
import json
import numpy as np
from PIL import Image

tokens = np.load("tokens.npy", mmap_mode="r", allow_pickle=False)
palette = np.load("palette.npy", allow_pickle=False)
with open("captions.json", encoding="utf-8") as f:
    captions = json.load(f)

i = 0
pixels = tokens[i].reshape(16, 16)
rgba = np.dstack((palette[pixels], (pixels != 0).astype("uint8") * 255))
Image.fromarray(rgba).save("example.png")
print(captions[i])
```

## Rights and provenance

Angais releases the sprites, captions and collection under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) to the extent of the rights Angais can waive. This dedication does not grant rights in third-party material, trademarks, or Krea's models.

All sprites are AI-generated outputs. No model weights or LoRA parameters are distributed here. Krea claims no ownership of generated outputs under §5.3 of the [Krea 2 Community License](https://www.krea.ai/krea-2-licensing). This release does not override that agreement, its commercial-use provisions (§2.3), or the [Krea Acceptable Use Policy](https://www.krea.ai/krea-2-use-policy). This is an independent dataset, not an official or endorsed Krea release.

## Support

If these sprites were useful in your project, you can [support future datasets on Buy Me a Coffee](https://buymeacoffee.com/angaisb_).
