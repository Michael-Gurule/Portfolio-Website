---
title: "The Beautiful Mathematics Behind Machine Learning"
date: 2025-02-08
summary: "The linear algebra, calculus, probability, and information theory under modern machine learning, followed into financial markets and fraud detection."
tags: [mathematics, machine learning, quantitative finance, fraud detection]
hero: ./images/the-beautiful-mathematics-behind-machine-learning/hero.png
heroAlt: "Placeholder hero image"
draft: false
---

Artificial intelligence runs on mathematics that is mostly old. The calculus behind model training dates to the late 1600s. The probability theory behind every confidence score took shape over the following century. Information theory, the youngest of the group, is nearly eighty. What changed is scale: these ideas now run billions of times a day, deciding whether a card transaction goes through and how a portfolio rebalances.

This piece walks through the core mathematics first, then follows it into two domains where it carries real money: financial markets and fraud detection. Once the equations make sense, the behavior of the models built on them starts to make sense too.

## Linear algebra: the working language

A neural network never sees an image, a price series, or a transaction. It sees arrays of numbers, called tensors, and most of its computation is linear algebra applied to them. A single layer computes

$$
y = Wx + b
$$

where $W$ is a weight matrix, $x$ the input vector, and $b$ a bias vector. Training adjusts $W$ and $b$ to reduce prediction error.

On its own, this is only a linear map, and stacking linear maps produces another linear map. The power comes from a nonlinear activation function between layers, $h = \sigma(Wx + b)$. Composing many such layers lets a network carve out decision boundaries of almost any shape, which is why the same basic machinery can separate cats from dogs, score credit risk, or generate text. Even convolutions and attention, the building blocks of image and language models, reduce to matrix multiplications at the hardware level. That is why GPUs, built for exactly that operation, became the engine of modern machine learning.

## Gradient descent: learning from error

Models learn by measuring how wrong they are and adjusting. The adjustment comes from calculus.

Picture the loss as a surface over the space of all parameters. Each point on the surface is one setting of the weights, and its height is the prediction error at that setting. Training means finding a low point. The gradient $\nabla L$ points in the direction of steepest increase, so each step moves the opposite way:

$$
\theta_{\text{new}} = \theta_{\text{old}} - \alpha \nabla L(\theta_{\text{old}})
$$

The learning rate $\alpha$ sets the step size. Too large, and the updates overshoot, oscillate, or diverge. Too small, and training crawls. Most training runs vary $\alpha$ over time with a schedule, and practitioners spend real effort tuning it.

Backpropagation computes these gradients efficiently for deep networks using the chain rule. For a weight $w_1$ in the first layer, with activations $a_1$ and $a_2$ in the layers above it:

$$
\frac{\partial L}{\partial w_1} = \frac{\partial L}{\partial a_2} \cdot \frac{\partial a_2}{\partial a_1} \cdot \frac{\partial a_1}{\partial w_1}
$$

Each factor measures how a change in one layer propagates to the next. Frameworks like PyTorch and TensorFlow compute these products automatically, but the structure explains a common failure. When many factors in the chain are small, the product shrinks toward zero and early layers stop learning. When they are large, the product blows up. These are the vanishing and exploding gradient problems.

## Probability: quantifying uncertainty

A classifier outputs a probability distribution. The softmax function turns raw outputs, called logits, into probabilities:

$$
P(y = i \mid x) = \frac{e^{z_i}}{\sum_j e^{z_j}}
$$

Every output lands between 0 and 1, and the outputs sum to 1. When an image classifier reports 92% cat and 8% dog, softmax produced those numbers. Whether they deserve trust as probabilities is a separate question, and it returns in the fraud section.

Maximum likelihood estimation supplies the principle behind training. If the training examples are independent, the likelihood of parameters $\theta$ given dataset $D$ is

$$
\mathcal{L}(\theta) = P(D \mid \theta) = \prod_i P(x_i \mid \theta)
$$

Multiplying thousands of small probabilities underflows floating-point arithmetic, so in practice we maximize the log-likelihood, which turns the product into a sum:

$$
\log \mathcal{L}(\theta) = \sum_i \log P(x_i \mid \theta)
$$

For classification, minimizing cross-entropy loss is exactly maximizing this log-likelihood when the model outputs a categorical distribution over labels. The standard loss function and the statistical principle are the same idea written two ways.

### Bayes' theorem

Bayes' theorem reverses the question. Likelihood asks how probable the data is under given parameters. The posterior asks how probable the parameters are given the data:

$$
P(\theta \mid D) = \frac{P(D \mid \theta)\, P(\theta)}{P(D)}
$$

The prior $P(\theta)$ encodes beliefs before seeing data, and the likelihood updates them. Bayesian neural networks apply this to the weights themselves, learning a distribution over each weight instead of a single value. The payoff is an honest statement of uncertainty: the model reports a prediction along with how much it would change under other plausible weights. Exact posteriors are intractable for networks of any real size, so these models rely on approximations such as variational inference or Monte Carlo dropout.

### Regularization

A model that fits its training data perfectly often fails on new data. Regularization adds a penalty that discourages this overfitting. L2 regularization (ridge) penalizes squared weights:

$$
L_{\text{total}} = L_{\text{data}} + \lambda \lVert w \rVert_2^2
$$

The coefficient $\lambda$ trades fit against weight size. The penalty has a Bayesian reading: minimizing it yields the maximum a posteriori estimate under a zero-mean Gaussian prior on the weights. In other words, it encodes a belief that large weights are unlikely.

L1 regularization (lasso) penalizes absolute values:

$$
L_{\text{total}} = L_{\text{data}} + \lambda \lVert w \rVert_1
$$

The corner of the absolute value at zero pushes many weights to exactly zero, which performs feature selection. Its Bayesian counterpart is a Laplace prior, which concentrates more mass at zero than a Gaussian does.

## Information theory: measuring surprise

Claude Shannon's 1948 work gave a precise way to measure uncertainty. The entropy of a distribution is its average surprise:

$$
H(X) = -\sum_i P(x_i) \log P(x_i)
$$

A fair coin has the maximum entropy possible for two outcomes. A weighted coin has less, because its result is more predictable.

Cross-entropy compares a predicted distribution $Q$ with the true distribution $P$:

$$
H(P, Q) = -\sum_i P(x_i) \log Q(x_i)
$$

It decomposes as $H(P, Q) = H(P) + D_{\mathrm{KL}}(P \parallel Q)$, where the Kullback-Leibler divergence

$$
D_{\mathrm{KL}}(P \parallel Q) = \sum_i P(x_i) \log \frac{P(x_i)}{Q(x_i)}
$$

measures the extra cost of using $Q$ in place of $P$. The data fixes $H(P)$, so minimizing cross-entropy loss amounts to minimizing the KL divergence between reality and the model. That is the precise sense in which training pulls a model's beliefs toward the world. KL divergence is also asymmetric; in general $D_{\mathrm{KL}}(P \parallel Q) \neq D_{\mathrm{KL}}(Q \parallel P)$, so the direction of comparison matters.

Variational autoencoders use KL divergence as a regularizer, penalizing the gap between each input's encoded distribution and a standard normal prior. That keeps the latent space smooth enough to interpolate between encoded examples and to sample new ones.

## Financial markets

Markets are a demanding test for this mathematics. Signals are weak, noise is heavy, and patterns shift as participants adapt to them.

### Sequence models

Prices, volumes, and indicators arrive as time series, where order matters. Recurrent neural networks carry a hidden state from one step to the next, and Long Short-Term Memory networks (LSTMs) add gates that control what that state keeps. The forget gate, for example:

$$
f_t = \sigma\left(W_f [h_{t-1}, x_t] + b_f\right)
$$

The sigmoid outputs a value between 0 and 1 for each component of the cell state, deciding how much of the past to retain. Input and output gates work the same way for what to add and what to expose. Because the cell state updates additively, gradients survive across far more time steps than in a plain RNN, which eases the vanishing gradient problem.

That lets an LSTM pick up dependencies that span long windows, such as volatility clustering: large moves tend to follow large moves, and calm tends to follow calm. Learning a relationship differs from learning a stable one, though. The correlation between stocks and bonds, for instance, has changed sign more than once over the past few decades, and a model trained on one regime can be confidently wrong in the next.

### Volatility

Financial returns are heteroskedastic: their variance changes over time. The GARCH(1,1) model captures this directly:

$$
\sigma_t^2 = \alpha_0 + \alpha_1 \varepsilon_{t-1}^2 + \beta_1 \sigma_{t-1}^2
$$

Today's variance depends on yesterday's squared shock and yesterday's variance, and the condition $\alpha_1 + \beta_1 < 1$ keeps the process stationary. When $\alpha_1 + \beta_1$ sits close to 1, as it often does in equity data, shocks to volatility decay slowly.

Machine learning models often take GARCH estimates as input features or learn similar dynamics in their hidden states. They can also draw on information GARCH ignores, such as the implied volatility in option prices. The loss function needs care here. Volatility forecasts feed position sizing and risk limits, so underestimating variance usually costs more than overestimating it.

### Portfolio optimization

Markowitz mean-variance optimization finds the lowest-variance portfolio that meets a return target:

$$
\begin{aligned}
\min_w \quad & w^\top \Sigma w \\
\text{subject to} \quad & w^\top \mu \geq r_{\text{target}}, \quad \textstyle\sum_i w_i = 1, \quad w_i \geq 0
\end{aligned}
$$

Here $w$ holds the portfolio weights, $\Sigma$ the covariance matrix of returns, and $\mu$ the expected returns. The optimization itself is a well-behaved convex problem. The difficulty lies in the inputs. Sample estimates of $\mu$ are noisy, and the optimizer amplifies that noise by concentrating weight in whichever assets look best by chance. Better estimation, through covariance shrinkage, factor models, or learned estimators, often matters more than any refinement to the optimizer.

Reinforcement learning reframes the problem. An agent learns a policy $\pi(a \mid s)$ that maps market states to allocation decisions, aiming to maximize the value function

$$
V(s) = \mathbb{E}\left[\sum_{t=0}^{\infty} \gamma^t r_t \,\middle|\, s_0 = s\right]
$$

which is the expected discounted return from state $s$ with discount factor $\gamma$. The policy gradient theorem gives the direction to improve the policy parameters:

$$
\nabla_\theta J(\theta) = \mathbb{E}\left[\nabla_\theta \log \pi_\theta(a \mid s)\, Q^{\pi}(s, a)\right]
$$

The agent shifts probability toward actions with high expected return $Q^{\pi}(s, a)$. In markets, this approach runs into two constraints. The agent can only learn from history that will not repeat exactly, and its own trades move prices in ways a backtest does not capture.

### Anomaly detection

Autoencoders learn to compress and reconstruct normal market behavior:

$$
\min \; \lVert x - \text{decoder}(\text{encoder}(x)) \rVert^2
$$

Inputs unlike the training data reconstruct poorly, so reconstruction error serves as an anomaly score. Thresholds come from the distribution of reconstruction errors on held-out normal data.

Isolation forests take a different route. Random splits isolate unusual points in fewer steps than typical ones, so the anomaly score is

$$
s(x, n) = 2^{-\mathbb{E}[h(x)] / c(n)}
$$

where $h(x)$ is the path length needed to isolate $x$ and $c(n)$ normalizes by the average path length in a dataset of size $n$. Scores near 1 flag anomalies, and scores well below 0.5 indicate normal points. Sudden volume spikes and unusual price moves land near the top.

## Fraud detection

Every card transaction passes through a model that has milliseconds to decide. It balances two costs: letting fraud through and blocking legitimate customers.

### Class imbalance

Fraud is rare, often around 0.1% of transactions. A model that labels everything legitimate scores 99.9% accuracy and catches nothing, so accuracy is the wrong yardstick. Precision and recall replace it:

$$
\text{Precision} = \frac{TP}{TP + FP} \qquad \text{Recall} = \frac{TP}{TP + FN}
$$

Precision is the share of flagged transactions that are actually fraud. Recall is the share of actual fraud the model catches. Raising one usually lowers the other. The $F_\beta$ score combines them with a chosen weighting:

$$
F_\beta = (1 + \beta^2) \cdot \frac{\text{Precision} \cdot \text{Recall}}{\beta^2 \cdot \text{Precision} + \text{Recall}}
$$

With $\beta = 1$ it reduces to the familiar F1 score. Setting $\beta = 2$ treats recall as twice as important as precision, a common choice when a missed fraud costs far more than a manual review.

### Resampling and cost-sensitive learning

SMOTE (Synthetic Minority Over-sampling Technique) creates synthetic fraud examples by interpolating between a fraud case $x_i$ and one of its $k$ nearest fraud neighbors:

$$
x_{\text{new}} = x_i + \lambda (x_{\text{neighbor}} - x_i), \quad \lambda \sim U(0, 1)
$$

This fills in the fraud region of feature space and gives the model more to learn from. One rule matters: apply SMOTE only to the training data, after the split. Oversampling first leaks synthetic copies of test cases into training and inflates every metric.

Cost-sensitive learning addresses the same problem through the loss function:

$$
L_{\text{weighted}} = \sum_i c_i \, L(y_i, \hat{y}_i)
$$

Errors on fraud cases carry a larger weight $c_i$, so the model learns that a miss costs more than a false alarm. The right ratio comes from the business: the average loss per missed fraud, weighed against the cost of reviewing a flagged transaction and the friction of declining a good customer.

### Calibration

A fraud score can drive decisions only if it means what it says. A well-calibrated model that assigns 0.80 to a set of transactions should see about 80% of them turn out to be fraud. Many models rank transactions well while producing miscalibrated scores, and gradient-boosted trees and models trained on resampled data are frequent offenders.

Platt scaling fits a sigmoid to the raw score $f$:

$$
P(\text{fraud} \mid f) = \frac{1}{1 + e^{A f + B}}
$$

with $A$ and $B$ fit on held-out data. Isotonic regression drops the sigmoid assumption and fits any monotonic mapping $m$:

$$
\min_m \sum_i \left(y_i - m(f_i)\right)^2 \quad \text{subject to} \quad m(f_i) \leq m(f_j) \text{ whenever } f_i \leq f_j
$$

Higher scores still map to higher probabilities, but the data sets the shape. Isotonic regression needs more data to avoid overfitting, which makes Platt scaling the safer choice when labeled fraud is scarce.

### Behavioral features

Fraud models depend heavily on features that capture behavior. Velocity features count recent events in a sliding window:

$$
v_t^{(w)} = \left|\{\text{transactions in } [t - w, t]\}\right|
$$

A compromised card often shows a burst of rapid transactions. Exact counts per card are simple to maintain. Across high-cardinality keys like merchant and device combinations, systems often switch to approximate structures such as the Count-Min Sketch, which accepts a small, bounded overcount in exchange for memory that stays fixed as the number of keys grows.

Graph features capture relationships. Cards that ship to the same address or share devices form connected structures, and graph neural networks learn from them through message passing:

$$
h_i^{(k+1)} = \text{UPDATE}\left(h_i^{(k)}, \text{AGGREGATE}\left(\{h_j^{(k)} : j \in \mathcal{N}(i)\}\right)\right)
$$

Each node updates its representation from its neighbors' representations. Fraud rings, where stolen cards funnel through linked accounts, produce patterns that no single transaction reveals.

Embeddings capture sequence. Borrowing the skip-gram objective from language modeling, a model learns transaction representations by predicting the transactions around each one:

$$
\max \sum_t \sum_{\substack{-c \leq j \leq c \\ j \neq 0}} \log P(\text{txn}_{t+j} \mid \text{txn}_t)
$$

Ordinary shopping sequences (groceries, gas, a home goods store) cluster apart from typical fraud sequences (jewelry, electronics, and airline tickets in quick succession).

### Ensembles

Fraud patterns shift as fraudsters adapt, and ensembles hold up better than single models. Gradient boosting builds an additive model one weak learner at a time:

$$
F_m(x) = F_{m-1}(x) + \gamma_m h_m(x)
$$

Each new learner $h_m$ fits the negative gradient of the loss with respect to the current predictions. For squared error, those are the ordinary residuals. For binary fraud labels, the usual loss is log-loss:

$$
L(y, p) = -y \log p - (1 - y) \log(1 - p)
$$

XGBoost and LightGBM add second-order information through a Taylor expansion of the loss, along with penalties on tree complexity that limit overfitting to rare fraud cases.

Stacking combines different model families. Base models such as logistic regression, random forests, gradient boosting, and neural networks each produce a prediction, and a meta-model learns how to combine them:

$$
\hat{y} = g\left(f_1(x), f_2(x), \ldots, f_k(x)\right)
$$

The meta-model learns how much to trust each base model. Given context features as well, it can learn to trust different models under different conditions. To avoid leakage, it trains on out-of-fold predictions, never on predictions for data the base models already saw.

## Putting it together

These tools rarely appear alone. A transformer computes attention through scaled dot products (linear algebra), trains with Adam, which adapts step sizes using running estimates of the gradient's first and second moments (statistics), and regularizes with dropout, which zeroes activations at random according to a Bernoulli distribution (probability).

A market model shows the same layering. An LSTM processes a price series through matrix operations, trains through backpropagation with gradient clipping to contain exploding gradients, carries an L2 penalty against overfitting to noise, and passes its outputs through calibration before anyone sizes a position on them.

A fraud system does all of this in milliseconds. Engineered features turn raw transactions into behavior. Gradient-boosted trees, each split chosen to reduce the loss, score the result. Resampling or cost weighting handles the imbalance, and calibration makes the final probability mean what it says.

The mathematics also marks the limits. The universal approximation theorem guarantees that a wide enough network can approximate any continuous function on a bounded domain. It says nothing about how much data that takes, whether gradient descent will find those weights, or how the model behaves on inputs unlike its training data. Those questions remain open research.

Knowing the math does not replace experience, but it changes how problems get diagnosed. A training run that will not converge points to the gradients. A fraud model whose precision collapses points to its thresholds and cost weights, or to a shift in the data underneath it. A market model that degrades points to a regime it has never seen.

The ideas are old. Calculus took shape in the late 1600s, probability theory across the 1600s and 1700s, matrix algebra in the 1800s, and information theory in 1948. What changed is the scale at which they run. The next card transaction anyone makes will pass through dozens of these calculations before the terminal responds.
