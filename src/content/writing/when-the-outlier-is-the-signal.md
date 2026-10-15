---
title: "When the Outlier Is the Signal: Reimagining Anomaly Detection for High-Stakes Engineering"
date: 2026-01-22
updated: 2026-10-15
summary: "In monitoring, the deviation is the reason the system exists. What changes when you stop treating outliers as noise."
tags: [anomaly detection, telemetry, reliability]
hero: ./images/when-the-outlier-is-the-signal/hero.png
heroAlt: "Placeholder hero image"
draft: false
---

Most data science training treats outliers as noise. Find the points beyond three standard deviations, remove them, and the model generalizes better to the typical case.

In monitoring work, that instinct runs backwards. When you watch satellite telemetry, a reactor's cooling loop, or traffic on a network, the typical data tells you the system is working. The deviation is the reason the monitoring exists: the early sign of a failing component, the slow drift of structural fatigue, the first trace of an intrusion. Normal data still matters, because it defines the baseline every deviation is measured against. But the decision to delete a point is a decision about what the system is allowed to notice.

The three-sigma rule carries a second problem. It assumes data that is roughly Gaussian, and much operational data is not. On heavy-tailed measurements such as latency, repair times, or packet loss, a three-sigma cut discards legitimate behavior along with the errors. (I wrote about that failure in [Averages Are the Wrong Summary for Most Things You Measure](/writing/averages-are-the-wrong-summary-for-most-things-you-measure).)

## Three kinds of anomaly

Treating every odd reading the same way produces a flood of false alarms. It helps to separate three kinds.

A point anomaly is a single value far from the rest, such as a sudden spike in voltage. It is the easiest to catch and the kind most thresholds are built for.

A contextual anomaly is a value that is normal in one setting and alarming in another. A high temperature reading is expected during a stress test and serious during an idle period. Catching it requires the detector to know the context, which usually means conditioning on operating mode, time of day, or load.

A collective anomaly is a run of values that each look normal but form an abnormal pattern together. A failing bearing in a turbine is the classic case. Every individual vibration sample sits within range, yet the energy at the bearing's characteristic defect frequencies rises steadily over weeks. No per-sample threshold sees it. A detector has to look at the sequence or its spectrum.

## Detection methods and where they fail

Simple z-score thresholds have a weakness beyond the Gaussian assumption. The outliers inflate the standard deviation used to find them, which masks the very points you want to flag. Replacing the mean and standard deviation with the median and the median absolute deviation fixes much of this at almost no cost, and it makes a sensible first baseline.

**Isolation forests** build random trees by picking a feature and a split value at random. Points that differ from the bulk of the data get isolated in fewer splits, so a short average path length marks an anomaly. The method scales well to many features, and inference is cheap enough for constrained hardware at the edge. It struggles with contextual anomalies, since a value that is only unusual given the operating mode does not isolate quickly, and with anomalies that arrive in clusters, which shield one another. Training on small random subsamples, as the original method does, reduces the second problem.

**Autoencoders** learn to compress normal data through a narrow bottleneck and reconstruct it. Inputs unlike the training data reconstruct poorly, and reconstruction error becomes the anomaly score. Two cautions apply. A large autoencoder can generalize well enough to reconstruct anomalies too, so the bottleneck has to be tight enough to matter. And the training set needs to represent normal operation, which is the one place where cleaning genuinely belongs. Remove known incidents from the training data, but keep them, labeled, as the test set that tells you whether the detector works.

**Graph neural networks** treat sensors as nodes and their dependencies as edges. In a mesh network or a complex machine, sensors move together: when one rises, its neighbors should follow. A GNN can flag the moment that relationship breaks, even when every individual reading stays in range. Before reaching for one, it is worth trying a simpler version of the same idea. Predict each sensor from its neighbors with a regression or a principal component model, and monitor the residuals. A broken relationship shows up as a residual that stops behaving, and the baseline takes an afternoon to build.

## Detection as risk management

Years of consulting work on risk taught me that outlier detection is a risk management problem as much as a modeling one. The costs of the two kinds of error are rarely symmetric. A missed anomaly in a marketing model means a customer did not get a coupon. A missed anomaly in a physical system can mean the loss of the system.

That asymmetry pushes toward recall, but recall alone is the wrong target. Base rates make false alarms the default outcome. Suppose real anomalies occur once in every 10,000 readings, and a detector catches 99% of them while wrongly flagging 1% of normal readings. Across a million readings it raises 99 true alarms and 9,999 false ones. Fewer than one alert in a hundred is real.

Operators who see that ratio learn to ignore the alerts, and an ignored alert has the same effect as a missed one. Alert fatigue is a recall failure of the whole system, people included. The right objective weighs the cost of a miss heavily while keeping the alert volume within what the operators can act on.

A tiered design handles this well:

1. A fast, high-recall stage at the edge flags anything plausibly wrong.
2. A heavier model in the gateway or cloud examines each flag with more context and filters out the false alarms.
3. Humans review the cases the models are uncertain about, while confident, well-understood cases trigger predefined responses.

Each stage can only remove true positives, never recover them. The end-to-end recall of the pipeline is lower than the recall of its first stage, so measure it directly, using held-out historical incidents or injected test events, instead of trusting the per-stage numbers.

## Where the logic runs

In systems that need to react quickly, detection cannot wait for a round trip to a central server. Running the first stage close to the hardware, on a gateway or the device itself, keeps response times short and keeps detection working when the network does not. On gateways, a container is a convenient way to ship and update the model. On constrained devices, a compiled model is usually the better fit.

One boundary matters here. In genuinely safety-critical systems, the protective functions that trip a reactor or command a safe state are deterministic, certified logic. Learned detectors run alongside them as an early-warning layer, catching the slow drifts and subtle patterns that hard limits miss and giving engineers time to act before a limit is ever reached.

## Keep the outliers

None of this argues against cleaning data. A sensor dropout, a unit conversion error, and a timestamp collision are errors, and they should be fixed. A real deviation in a real system is the record of something that happened. Before removing a point, decide which of the two it is. When the answer is unclear, keep the point, label it, and let it test the detector.
