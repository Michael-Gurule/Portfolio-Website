---
title: "The Newcomb Paradox: What a Thought Experiment Can Teach Us About Trusting Models"
date: 2026-03-10
updated: 2026-10-15
summary: "A sixty-year-old decision puzzle about a near-perfect predictor, and what it says about the gap between predicting an outcome and acting on the prediction."
tags: [decision theory, causal inference, machine learning]
hero: ./images/the-newcomb-paradox/hero.png
heroAlt: "Placeholder hero image"
draft: false
---

Imagine a predictor with an unusual record. It has studied thousands of people facing the choice you are about to make, and it has almost never been wrong about what they would do. It places two boxes in front of you.

Box A is transparent and holds \$1,000. Box B is opaque. The predictor tells you it holds either \$1,000,000 or nothing. You may take Box B alone, or both boxes. Before you walked in, the predictor made its forecast. If it predicted you would take both boxes, it left Box B empty. If it predicted you would take only Box B, it put the million inside.

| | Predictor was right | Predictor was wrong |
|---|---|---|
| Take only Box B | \$1,000,000 | \$0 |
| Take both boxes | \$1,000 | \$1,001,000 |

What do you do?

This is Newcomb's problem. William Newcomb, a physicist at Lawrence Livermore, devised it, and the philosopher Robert Nozick brought it to wide attention in 1969. Nozick noted that almost everyone finds the answer obvious, and that they "seem to divide almost evenly on the problem," each side convinced the other is being silly. The split has held. In the 2020 PhilPapers survey of professional philosophers, 39% chose two boxes and 31% chose one, with the rest undecided or holding other views.

The problem also contains a practical lesson for anyone who builds predictive models or acts on them.

## Two arguments that disagree

The first argument is about dominance. The contents of Box B were fixed before you entered the room, and nothing you do now can change them. Whatever is in Box B, taking both boxes gets you \$1,000 more. If the million is there, you leave with \$1,001,000 instead of \$1,000,000. If it is not, you leave with \$1,000 instead of nothing. Two boxes wins in every state of the world.

The second argument is about evidence. If the predictor is right with probability $p$, the expected payoffs are

$$
\mathbb{E}[\text{one box}] = p \cdot 1{,}000{,}000
$$

$$
\mathbb{E}[\text{two boxes}] = 1{,}000 + (1 - p) \cdot 1{,}000{,}000
$$

One box comes out ahead whenever $p > 0.5005$. The predictor barely has to beat a coin flip. With a near-perfect predictor, one-boxers almost always walk away rich and two-boxers almost always walk away with \$1,000.

Both arguments are valid. They differ in what they treat as relevant. The second follows evidential decision theory: choose the action whose occurrence is the best news about the outcome. The first follows causal decision theory: consider only what your action actually brings about. Your choice is excellent evidence about what is in the box, and it has no causal effect on what is in the box. The paradox lives in that gap.

The one-boxers have a pointed reply to their critics, which David Lewis took as the title of a 1981 paper: "Why ain'cha rich?" Lewis, a two-boxer, answered that the problem is rigged. The predictor rewards a disposition in advance, so a rational chooser can predictably end up poorer, and that says more about the setup than about rationality. The question underneath is whether rationality means following a sound procedure or getting the better result, and sixty years of argument have not settled it.

## Predictions are evidence, decisions are interventions

A predictive model is an evidential instrument. A churn model, a credit score, and a failure forecast all learn how outcomes correlate with features in historical data. Formally, they estimate something like $P(\text{outcome} \mid \text{features})$.

Acting on a prediction raises a causal question. When a bank calls a customer flagged as likely to leave, the relevant quantity is what happens to that customer because of the call. In the notation of causal inference, that is $P(\text{outcome} \mid \text{do}(\text{action}))$, and no amount of predictive accuracy supplies it.

Newcomb's problem sits exactly on the boundary between these two quantities, and so does much of applied machine learning. Most of the trouble comes from treating one as the other.

## When acting on a prediction changes what it predicts

Consider a bank that deploys a churn model and sends retention offers to the customers it flags. Many of them stay. In hindsight the model looks inaccurate, because the people it called high-risk did not leave. A naive review concludes that the model was wrong. A careful review recognizes that the model may have been right and the offer may have worked, and that the data, as collected, cannot tell those stories apart.

The fix is to measure the intervention, not just the prediction. Hold back a randomly chosen group of flagged customers who receive no offer. Comparing their churn with the treated group's churn estimates the effect of the offer. Uplift modeling extends the same idea, targeting the customers whose behavior the offer actually changes rather than the customers most likely to leave. Those groups overlap less than intuition suggests, since some high-risk customers leave regardless and some low-risk ones were never going anywhere.

The reverse loop is more dangerous. Suppose a lender's model rates some neighborhoods as high credit risk, and the lender denies loans there. Investment dries up, local businesses struggle, and conditions worsen. A model retrained on the new data now rates those neighborhoods as even riskier. The prediction did not only describe the world; it helped produce the world it described. Researchers call this performative prediction.

The same lender also faces a quieter problem. Denied applicants never receive loans, so the data never records whether they would have repaid. The model's mistakes about the people it rejects are invisible by construction. This is the selective labels problem, and it means a model can be confidently wrong about exactly the population it most affects.

In both loops the prediction and the decision are entangled, the way the predictor's forecast and your choice are entangled in Newcomb's room. Evaluating the model as though its outputs had no effect on its future inputs mistakes the setup.

## What the paradox asks of practitioners

The paradox does not say whether to take one box or two. It does suggest a few questions worth asking before acting on any model.

What did the model learn to predict, and is that the decision you are making? A model trained on correlations answers an evidential question. If your decision is an intervention, you need evidence about the intervention, which usually means an experiment, a holdout, or a credible causal argument.

Will acting on the prediction change the data the model learns from next? If so, accuracy measured after deployment no longer means what it meant before. Treat deployment as the start of a monitoring problem, with holdout groups that keep a clean view of the counterfactual.

Can you say why the model is right, beyond the fact that it has been right? A model that captures a mechanism tends to survive a change in conditions. A model that captures only a pattern is a predictor with a good record, which is precisely the kind of entity Newcomb asks us to think hard about trusting.

Newcomb's predictor is nearly infallible, and the puzzle is still hard. Real models are not, and the decisions they inform change the world they were trained on. That makes the question more practical than it first appears, and no less difficult.
