---
title: "Convexity Is What Makes a Problem Solvable, and Almost Nothing Is Convex"
date: 2026-10-15
summary: "Most applied optimization quietly swaps the real problem for a convex one. An experiment on what that swap costs, and how to tell when it is expensive."
tags: [optimization, convex relaxation, portfolio construction]
hero: ./images/convexity-is-what-makes-a-problem-solvable/hero.png
heroAlt: "Placeholder hero image"
draft: false
---

A convex problem has one basin. Start anywhere, walk downhill, and you arrive at the global optimum, with a certificate that it is global. That property separates problems you can solve from problems you can only attempt, and it is worth more than any particular algorithm.

Almost nothing you actually want to optimize has it. So the working pattern across applied optimization is to relax: replace the real problem with a convex one that resembles it, solve that, and map the answer back. The relaxation is where modeling assumptions get buried, and most practitioners never measure what it cost.

## What the relaxation buys

Consider minimum-variance portfolio construction:

$$
\min_w \; w^\top \Sigma w \quad \text{subject to} \quad \mathbf{1}^\top w = 1
$$

This is convex, and in this form it even has a closed-form solution, $w^\star = \Sigma^{-1}\mathbf{1} / (\mathbf{1}^\top \Sigma^{-1} \mathbf{1})$. It solves instantly at any realistic size.

Now add a constraint anyone running the portfolio would want: hold at most $k$ positions.

$$
\lVert w \rVert_0 \leq k
$$

Here $\lVert w \rVert_0$ counts the non-zero weights. This cardinality constraint is not convex, and it changes the category of the problem. The feasible set becomes a union of subspaces, one for each choice of $k$ assets, and the single-basin structure is gone.

The honest solution is to enumerate. For 12 assets choosing 3, that is $\binom{12}{3} = 220$ subproblems, which is nothing. For 500 assets choosing 5, it is $\binom{500}{5} = 255{,}244{,}687{,}600$, which is not. Exhaustive search stops being an option almost immediately, and that pressure is what makes relaxation attractive rather than lazy.

So you relax. Solve the convex problem over all assets, keep the $k$ largest weights, and renormalize. It is fast, simple, and gives you something.

## What it actually costs

I ran this over 400 randomly generated covariance structures, half single-factor and half with two correlated blocks, and compared the relaxed-and-rounded answer against an exhaustive search of every subset.

For $k = 3$ out of 12:

| percentile | excess variance |
|---|---:|
| median | 0.27% |
| p75 | 5.16% |
| p90 | 18.34% |
| p95 | 27.01% |
| p99 | 81.33% |
| max | 89.45% |

Fifty-six percent of problems came in under 1%, which is effectively free. A quarter came in over 5%. The worst case carried 89% more variance than the true optimum.

The pattern held at $k = 4$ and $k = 5$, with the median staying near 0.3% and the upper tail growing slightly heavier.

That distribution is the real answer, and it is more useful than either story people usually tell. The relaxation is neither a disaster nor free. It is nearly free most of the time and occasionally expensive, which is the worst possible shape for a failure mode, because the typical experience teaches you to trust it.

The structure predicts which case you are in. The expensive failures clustered in the block-correlated problems, where the relaxed solution spreads weight across both blocks and the top-$k$ rounding then concentrates it inside one. The benign cases were the single-factor ones, where the weights already come nearly sorted by the thing that matters.

## Where the pattern shows up

L1 as a stand-in for sparsity. The lasso penalizes $\lVert w \rVert_1$ because counting non-zero coefficients is non-convex, and on the box where every coefficient lies between $-1$ and $1$, the L1 norm is the tightest convex function that sits below the count. Conditions exist under which the two give the same answer. They are rarely checked, and some, such as the restricted isometry property, are computationally hard to verify for a given dataset.

Relaxing integrality. Integer programs are routinely solved as linear programs with the integer requirement dropped, then rounded. It is the same structure with the same open question about the gap.

Semidefinite relaxations. Max-cut and similar combinatorial problems relax to a semidefinite program with a provable guarantee: the Goemans-Williamson rounding achieves at least 0.878 of the optimal cut in expectation. Here the gap is bounded in advance, which puts it in a better position than the portfolio case, where it is not.

Squared error as a stand-in for what you care about. Nobody actually wants to minimize squared error. They want a decision to come out right. Squared error gets used because it is convex and differentiable, and the substitution is so routine that it stops looking like a modeling choice.

## What this does not claim

Non-convex optimization works far better in practice than worst-case theory suggests, and deep learning is the obvious demonstration. There is good evidence that in very high dimensions most problematic critical points are saddles rather than poor local minima, and stochastic gradient methods tend to escape them. "Non-convex is intractable" describes the worst case, not a typical Tuesday.

Some relaxations come with guarantees. When a bound on the gap exists, you are in a much better position than in this portfolio example, where the gap is knowable only by solving the hard problem you were trying to avoid.

Exact methods have also improved. Modern mixed-integer solvers handle cardinality-constrained problems at sizes that were hopeless fifteen years ago, so the honest comparison is often against branch-and-bound rather than brute force.

## What to do

Notice when you are relaxing. The L1 penalty, the squared error, and the dropped integrality constraint are each modeling decisions that usually get made silently.

Measure the gap at a size where you can. If the real problem has 500 assets, solve a 12-asset version exactly and see how the relaxation behaves on your actual covariance structure. That answer transfers better than intuition does.

Find out which regime your data is in. In this experiment the correlation structure determined almost everything, and it is checkable before you commit.

Re-solve on the selected support. After choosing the $k$ assets, solving the small problem exactly over just those assets, rather than renormalizing, can only lower the variance, because the renormalized weights are one feasible point of that smaller problem.

When the gap matters and the problem is small enough, use an exact solver. The reason to relax is tractability, and if you already have tractability, the relaxation buys nothing.
