"""Keys a green-screen still (assets/img/v1/layers/<name>-green.jpg) into a transparent PNG layer
(<name>.png) so a character can move separately from its background in the film.

Usage (from the module folder): py -3 -X utf8 video/v1/layers.py 08-manager
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

DIR = Path(__file__).resolve().parents[2] / "assets/img/v1/layers"


def key(name):
    im = Image.open(DIR / f"{name}-green.jpg").convert("RGB")
    a = np.asarray(im).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    green = g - np.maximum(r, b)                        # how much greener than the other channels
    alpha = np.clip(1 - (green - 25) / (90 - 25), 0, 1)  # 25 or less: opaque, 90 or more: transparent
    a[..., 1] = np.minimum(g, np.maximum(r, b) + 8)     # remove green spill on the edges
    m = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    out = Image.fromarray(a.astype(np.uint8)).convert("RGBA")
    out.putalpha(m)
    out.save(DIR / f"{name}.png")
    print(f"{name}.png {out.size}, opaque {np.mean(alpha > 0.5):.0%} of the frame")


if __name__ == "__main__":
    for n in sys.argv[1:]:
        key(n)
