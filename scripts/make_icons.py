"""Generate the site's favicon and app icons from the MG monogram master image.

Run from the repo root:  python3 scripts/make_icons.py
Source: public/Assets/images/icons/icon-full.jpg (square, dark monogram on the light canvas).

Small tab sizes (16-48 px) use a tight crop around the letters so they stay legible; the
underline and margins would only blur at that size. Larger icons keep the full design.
"""

# %% Imports
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ICONS = ROOT / "public" / "Assets" / "images" / "icons"
SRC = ICONS / "icon-full.jpg"


# %% Helpers
def clean_background(
    img: Image.Image, tol: float = 14.0
) -> tuple[Image.Image, tuple[int, int, int]]:
    """Flatten JPEG noise in the background to one exact color.

    Args:
        img: RGB source image.
        tol: Max per-pixel RGB distance from the corner color to count as background.
    Returns:
        The cleaned image and the background RGB color.
    """
    arr = np.asarray(img.convert("RGB")).astype(np.float32)
    corners = np.stack(
        [arr[:8, :8], arr[:8, -8:], arr[-8:, :8], arr[-8:, -8:]]
    ).reshape(-1, 3)
    bg = np.median(corners, axis=0)
    near = np.linalg.norm(arr - bg, axis=-1) < tol
    arr[near] = bg
    bg_rgb = tuple(round(float(c)) for c in bg)
    return Image.fromarray(arr.astype(np.uint8)), bg_rgb


def tight_square(
    img: Image.Image, bg: tuple[int, int, int], pad: float = 0.08
) -> Image.Image:
    """Crop to a square around the dark letterforms, dropping the red underline.

    Args:
        img: Cleaned RGB image.
        bg: Background color used to fill any padding.
        pad: Margin on each side as a fraction of the crop size.
    Returns:
        Square RGB crop centered on the monogram.
    """
    arr = np.asarray(img.convert("RGB")).copy()
    ys, xs = np.nonzero(arr.mean(axis=-1) < 90)  # ink only; the underline is lighter
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    arr[y1 + 2 :] = bg  # blank everything below the letters, underline included
    side = int(max(x1 - x0, y1 - y0) * (1 + 2 * pad))
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    canvas = Image.new("RGB", (side, side), bg)
    left, top = cx - side // 2, cy - side // 2
    canvas.paste(
        Image.fromarray(arr).crop((left, top, left + side, top + side)), (0, 0)
    )
    return canvas


def resized(img: Image.Image, size: int) -> Image.Image:
    """Downsample to size x size with Lanczos filtering."""
    return img.resize((size, size), Image.Resampling.LANCZOS)


# %% Main
def main() -> None:
    """Write favicon.ico, favicon-32.png, apple-touch-icon.png, icon-192.png and icon-512.png."""
    full, bg = clean_background(Image.open(SRC))
    tight = tight_square(full, bg)

    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    tight.save(ROOT / "public" / "favicon.ico", sizes=ico_sizes)
    resized(tight, 32).save(ICONS / "favicon-32.png", optimize=True)

    resized(full, 180).save(ROOT / "public" / "apple-touch-icon.png", optimize=True)
    resized(full, 192).save(ICONS / "icon-192.png", optimize=True)
    resized(full, 512).save(ICONS / "icon-512.png", optimize=True)
    print(f"Wrote icons from {SRC.relative_to(ROOT)} (background {bg})")


if __name__ == "__main__":
    main()
