---
title: "Averages Are the Wrong Summary for Most Things You Measure"
date: 2026-10-15
summary: "On heavy-tailed data the mean is neither typical nor stable. A simulation of what goes wrong, and how to choose the statistic that fits the decision."
tags: [statistics, heavy tails, observability]
hero: ./images/averages-are-the-wrong-summary/hero.png
heroAlt: "Placeholder hero image"
draft: false
---

Picture an engineering team and a business team reviewing the same latency data and disagreeing about whether anything is wrong. The dashboard shows an average response time of 269 milliseconds, well within target. The engineers are looking at the 99th percentile, which sits at 2,134 milliseconds.

Neither number is incorrect. The numbers in this piece come from a simulation, but the disagreement is a common one. The data is heavy-tailed, and on heavy-tailed data the mean and the tail describe different things.

## Two datasets with the same mean

I generated two sets of 200,000 latency measurements. The first comes from a Pareto distribution with tail index $\alpha = 1.4$, a common stand-in for quantities like request latency, incident duration, and claim size. The second is Gaussian, with its mean set to match.

| | mean | median | p95 | p99 | max |
|---|---:|---:|---:|---:|---:|
| heavy-tailed | 269.2 | 131.1 | 682.0 | 2,133.7 | 174,776.8 |
| light-tailed | 269.2 | 269.3 | 367.4 | 407.9 | 539.5 |

Identical means. Everything else diverges.

In the light-tailed case the mean and median agree to within a tenth of a unit, so a single number genuinely summarizes the distribution. In the heavy-tailed case the mean sits at twice the median, and the maximum is about eighty times the p99.

Two consequences follow. First, 81.7% of requests are faster than the average, so the mean is not a typical value here, or close to one. For a Pareto distribution with minimum $x_m$, the share below any value $t$ is $1 - (x_m / t)^{\alpha}$, and the simulation matches it. Second, the slowest 1% of requests account for 23.8% of all time spent. In theory the top fraction $q$ of a Pareto population holds a share $q^{\,1 - 1/\alpha}$ of the total, which gives 26.8% for the top 1%. The sample comes in lower because the sample mean itself runs low, for reasons the next section explains.

## The mean is unstable as well as misleading

The deeper issue is that the sample mean of a heavy-tailed distribution does not settle down the way intuition expects. A Pareto distribution has a finite mean only when $\alpha > 1$ and a finite variance only when $\alpha > 2$. At $\alpha = 1.4$ the mean exists but the variance is infinite, and the central limit theorem does not apply in its usual form.

I drew 500 independent samples of 20,000 observations each and computed the mean of every one.

| | standard deviation of the sample mean | range observed |
|---|---:|---:|
| heavy-tailed | 41.97 | 247 to 943 |
| light-tailed | 0.42 | 268 to 270 |

The heavy-tailed mean is roughly a hundred times less reproducible. Two careful analysts measuring the same system on the same day, with twenty thousand observations each, could report 247 and 943 and both be right. Even the standard deviation in the table is unstable here; rerun the experiment and it moves, because it is estimating a quantity that does not exist.

The median on the same heavy-tailed data has a standard deviation of 0.65, about sixty-five times more stable than the mean. That inverts the usual intuition that the mean is the efficient estimator. The intuition holds for well-behaved distributions. It fails here.

## Where this shows up

Latency is the familiar case. Performance teams report percentiles because the mean hides the experience of the users having the worst time, and those users are disproportionately the ones who leave.

Incident duration and time to repair behave the same way. A handful of long incidents dominate the total, so mean time to repair moves mostly with whether a bad one landed in the window.

Claim sizes, loss severity, and project overruns are heavy-tailed, which is why insurance has long reasoned in terms of tail distributions rather than averages.

File sizes, session lengths, city populations, and wealth follow the same pattern, and each produces the same complaint: the average does not describe anyone.

## What this does not claim

The mean is not useless. When you need a total, the mean times the count gives it exactly, and no percentile does. Capacity planning, cost forecasting, and anything additive genuinely want the mean.

Percentiles bring their own problems. The p99 of a chain of services is not the sum of their p99s, and averaging percentiles across shards or time windows produces a number with no interpretation. Tail estimates are also noisy by construction, since a p99 on 10,000 observations rests on about 100 points.

Tail index estimation is unreliable too. Hill estimators are sensitive to where you cut the tail, and reasonable people get meaningfully different answers from the same data. Saying "this is heavy-tailed" is usually defensible. Saying "alpha is 1.4" usually is not.

## What to do

Plot the distribution before summarizing it. A histogram on a log scale takes one line of code and answers the question immediately.

Report the median alongside the mean. When they diverge by a factor of two, the shape is the finding, and no single number will carry it.

Match the statistic to the decision. Capacity and cost want the mean. User experience and service levels want percentiles. Choose deliberately rather than by dashboard default.

Treat a single sample mean on heavy-tailed data as an estimate with wide error bars, and be wary of comparing this week's average to last week's. On this distribution, that comparison mostly measures luck.
