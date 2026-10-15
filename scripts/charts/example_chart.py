"""Worked example: a highlighted bar chart and a line chart in the site style.

Run from the repo root:  python3 scripts/charts/example_chart.py [output folder]
Writes to src/content/writing/images/<output folder>/ (default: chart-examples).
"""
import sys

import matplotlib.pyplot as plt
import numpy as np

import site_charts as sc

folder = sys.argv[1] if len(sys.argv) > 1 else "chart-examples"
sc.use_style()
rng = np.random.default_rng(7)

# Bar chart: neutral bars, the one that matters in red
values = rng.uniform(0.2, 1.0, 14)
fig, ax = plt.subplots()
ax.bar(np.arange(14), values, width=0.8, color=sc.highlight(14, index=4))
sc.label(ax, "Excess variance by trial")
ax.set_xlabel("Trial")
ax.set_ylabel("Excess variance")
sc.save(fig, folder, "bar-example")

# Line chart: reference series in ink and gray, the finding in red
t = np.linspace(0, 10, 400)
fig, ax = plt.subplots()
ax.plot(t, np.sin(t), label="Baseline")
ax.plot(t, np.sin(t) + 0.3 * np.cos(3 * t), label="Seasonal")
observed = np.where(t >= 6, np.sin(t) + rng.normal(0, 0.3, t.size), np.nan)
ax.plot(t, observed, color=sc.ACCENT, label="Observed")
sc.label(ax, "Observed against baselines")
ax.set_xlabel("Hours")
ax.set_ylabel("Signal")
ax.legend(loc="lower left")
sc.save(fig, folder, "line-example")
