---
title: "Your Phone Already Knows Where You're Going"
date: 2026-11-02
summary: "The surprising predictability of human routine."
tags: [Machine Learning, Statistics, On-Device Models]
hero: ./images/your-phone-already-knows-where-youre-going/hero.png
heroAlt: "Title: The surprising predictability of human routine."
draft: false
---


It's a little before eight on a Tuesday. You pick up your phone to check the weather, and a small notification sits at the top of the screen: twenty-two minutes to work, traffic light.

You didn't ask. You didn't open a map or type an address. The phone just offered it, the way a coworker might say "heading out?" when they hear the jingle of your keys and clap of your laptop closing.

The first time this happened, it might have felt a little intrusive. After a while, it likely started to go unnoticed. I think that this moment deserves a second look, though, because your phone has managed to pull off something particularly clever. It hasn't read your mind, but it has been silently observing your actions and habits.

## Places, not coordinates

Our phones record their approximate location as a stream of coordinates, pairs of latitude and longitude that have little meaning on their own. A raw coordinate has no idea whether it marks your kitchen or the drive-thru of that coffee shop with the irresistible banana bread muffins along your route to the office.

So your phone takes the first step turning that data stream into named places. A function within the core operating system looks for spots where your coordinates pile up, where you linger for hours and return again and again. A cluster where you spend most nights becomes a strong candidate for home. A cluster where you spend weekday daytime hours becomes a candidate for work. Shorter, regular stops become the gym, a parent's house, the grocery store you visit every Sunday.

You never supply these labels, at least at first. The phone infers them from the shape of your time. Eight hours of stillness, most nights (*we can dream*), in the same place, informs it where you likely live.

## Counting is most of the trick

Once the phone has compiled a short list of your *places*, prediction starts with something almost embarrassingly simple—It counts.

Over the past few months, how many times have you left home on a weekday morning? And of those times, how often did you end up at work? If the answer is forty-one out of forty-five, the phone has a strong case. When you pick it up at 7:40 on a Tuesday, the work suggestion requires no leap or blind guessing.

Statisticians call this conditional probability. The useful question adds conditions: where does this person usually go on a weekday, in the morning, starting from home? Each condition narrows the possibilities. Saturday at ten from home points somewhere else entirely. Thursday at six from work might point to the gym, if that's your pattern.

Many of these systems also lean on an idea from the early 1900s, a model named after the Russian mathematician Andrey Markov. A Markov chain assumes that where you go next depends mostly on where you stand now. From home in the morning, you usually go to work. From work in the evening, you usually go home, or sometimes to dinner. The on-device model keeps a table of these transitions and their odds, learned from your own history. It doesn't need your whole life story. It only needs your current spot and what usually comes after it.

## Changing its mind mid-drive

The prediction keeps working after you leave. It updates.

Say you usually drive straight to work, but on Thursdays you sometimes stop at the gym first. When you pull out of the driveway, the phone leans toward work. Then you turn left at the corner where you'd normally turn right. That single turn shifts the odds. The gym, a long shot a minute ago, now looks likely. Another turn, and the phone grows more confident still.

The math behind this update dates to the 1760s and a rule named for the English minister Thomas Bayes. Bayes' rule describes how to revise a belief when new evidence arrives. You start with a guess based on history. Every new piece of information, a turn, a speed, the hour, pushes that guess up or down. The phone never needs certainty. It only needs a current best guess that keeps getting better.

## How predictable are we, really?

Most of us like to think of ourselves as at least a little spontaneous, but the data tends to disagree.

In 2010, a team of physicists led by Chaoming Song and Albert-László Barabási published a study in *Science* that asked a blunt question: how predictable is human movement? They analyzed anonymized mobile phone records from about 50,000 people over three months, tracking which cell towers each phone connected to over time.

They measured the randomness in each person's movement using a quantity borrowed from information theory called entropy. Low entropy means your movement follows a pattern. High entropy means it looks more like a coin toss. From there, they calculated an upper limit on how well any method could ever predict where a person would be.

The number came out at 93 percent.

That figure means something specific—It doesn't claim that the model’s prediction is right 93 percent of the time. It says that a good enough model could, in principle, predict a typical person's location that often, because the pattern lives in the data. The remaining seven percent belongs to the unexpected: the road trip, the detour, the friend who calls with a last-minute invitation.

The part of the study that surprised me most came next. The researchers expected people who travel long distances, who cover more ground and visit more places, to resist prediction, but they didn't. Predictability held steady across people, whether they rarely left their neighborhood or regularly crossed a larger region. Covering more ground didn't make anyone more random, it just made their pattern bigger.

## When the guess goes wrong

Anyone who has seen "twenty-two minutes to work" on a holiday morning knows the base model has its limits. It might have learned your routine, but it has no idea that your office if closed for the day, or that you started a new job last week, or that you're on vacation two time zones away.

These errors reveal the system’s logic, it works on frequencies. It knows what usually happens, and it keeps betting on the usual until enough unusual days pile up to change its mind. Move to a new apartment, and for the first couple of weeks your phone will keep suggesting routes from the old one. It needs a stack of new mornings before the old pattern lets go.

## A signature you write without trying

This capability makes some people uneasy, and that unease deserves a straight answer. A record of where you go reveals a lot: where you sleep, where you work, who you visit, which doctor you see. Phone makers have largely moved this processing onto the device itself and given people controls to review and delete it. Use them if the trade doesn't sit right with you.

The bigger lesson concerns us more than our phones. We move through our weeks with far more regularity than we notice. The coffee shop, the commute, the Sunday call home. Each choice feels free in the moment, and each one is. Together, though, they draw a pattern so consistent that a simple algorithm can read it. 