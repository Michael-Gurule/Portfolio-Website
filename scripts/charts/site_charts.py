"""Helpers for article figures in the site style.

    import sys; sys.path.append("scripts/charts")   # from the repo root
    import site_charts as sc

    sc.use_style()
    fig, ax = plt.subplots()
    ax.bar(x, y, color=sc.highlight(len(y), index=3))
    sc.label(ax, "Relaxation gap")
    ax.set_xlabel("..."); ax.set_ylabel("...")
    sc.save(fig, "convexity-is-what-makes-a-problem-solvable", "relaxation-gap")

Then reference it in the article:
    ![Alt text](./images/<folder>/<name>.png "Figure 1. Caption.")
"""
from pathlib import Path

import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[2]
STYLE = Path(__file__).with_name("site.mplstyle")
IMAGES = ROOT / "src" / "content" / "writing" / "images"

INK = "#111418"
TEXT = "#4B5563"
MUTED = "#8A93A0"
NEUTRAL = "#C9CED6"
RULE = "#E5E7EB"
ACCENT = "#EA4F3D"


def use_style():
    plt.style.use(STYLE)


def highlight(n, index, base=NEUTRAL, accent=ACCENT):
    """Colors for n marks with one picked out in the accent: the site's 'one red mark per view'."""
    return [accent if i == index else base for i in range(n)]


def label(ax, text):
    """Small uppercase mono label above the plot, like the site's section labels."""
    ax.set_title(text.upper(), loc="left", family=["Menlo", "DejaVu Sans Mono", "monospace"], color=MUTED, fontsize=8)


def save(fig, folder, name):
    """Write src/content/writing/images/<folder>/<name>.png at 1400 x 800 and return the Markdown path."""
    out = IMAGES / folder / f"{name}.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.tight_layout()
    fig.savefig(out)
    plt.close(fig)
    rel = f"./images/{folder}/{name}.png"
    print(f"Wrote {out.relative_to(ROOT)}  ->  ![Alt text]({rel} \"Caption\")")
    return rel
