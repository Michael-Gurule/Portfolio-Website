# Article image tools

Local tools for making article images in the site style. Nothing here is deployed.

## Hero images

```sh
npm run hero -- <slug>
npm run hero -- <slug> --title "Shorter Title" --label "Statistics" --seed 3
```

- `<slug>` is the article filename without `.md`.
- The title defaults to the article title up to its first colon. Keep it to three lines or fewer (about 100 characters).
- The label defaults to the article's first tag, shown in uppercase.
- Each slug draws its own curve. Pass `--seed` with any number to try a different one.
- Output: 1600 × 900 PNG. It goes to the article's existing `hero:` path, or to `./images/<slug>/hero.png`, which is then added to the frontmatter. Fill in `heroAlt` afterwards.

## Charts

Python + matplotlib, run from the repo root:

```python
import sys; sys.path.append("scripts/charts")
import matplotlib.pyplot as plt
import site_charts as sc

sc.use_style()
fig, ax = plt.subplots()
ax.bar(x, y, color=sc.highlight(len(y), index=4))  # one bar in red, the rest gray
sc.label(ax, "Excess variance by trial")          # small mono label above the plot
ax.set_xlabel("Trial"); ax.set_ylabel("Excess variance")
sc.save(fig, "<image folder>", "<name>")          # writes src/content/writing/images/<folder>/<name>.png
```

`python3 scripts/charts/example_chart.py` renders a bar and a line example into `images/chart-examples/` (delete that folder after looking).

Style rules that keep charts consistent with the site:

- Neutral series come first: ink `#111418`, gray `#8A93A0`, light gray `#C9CED6`. Use red (`sc.ACCENT`, `#EA4F3D`) for the one thing the chart is about.
- Put the chart's name in `sc.label`, not a large title. The caption carries the takeaway.
- Export through `sc.save` so every figure is 1400 × 800 on white.

Place a chart in an article on its own line. The quoted text becomes the caption:

```markdown
![Alt text describing the chart](./images/<folder>/<name>.png "Figure 1. What the chart shows.")
```
