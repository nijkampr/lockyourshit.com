# ADR-0004: The counter is measured here, or it's a visible joke

**Status:** Proposed · 2026-11-15, updated 2026-11-16

## Context

The original idea had a world map and "N laptops have been left unlocked". Counting worldwide needs somewhere to count, and we have no backend. The constraint is: don't present a fake statistic as real.

## Options considered

| Option | Verdict |
|---|---|
| **A free third-party hit counter API** | Rejected. Every victim's laptop would call a stranger's server from inside a bank. That is analytics that phone home with extra steps, it breaks ADR-0005, and free counter services die without notice. |
| **A made-up number that ticks up convincingly** | Rejected. That's the fake statistic the constraint forbids. |
| **GitHub stars, baked into a JSON file by a weekly Action** | Honest, and makes no client request. Not v1. It's in the backlog as "union membership". |
| **Numbers the page can measure itself, plus an openly fake worldwide line** | Chosen. |

## Decision

**Every number shown as a fact is measured on this machine.**

- **Time unattended.** The clock at trigger minus the clock at arming. This is the hero number of the whole site, and it beats a global counter because it's about you.
- **Date and time of the offence.** From the same clock.
- **Offences on this laptop.** The one stored integer (ADR-0005). The receipt says "(that we know of)", because it only knows this browser.
- **The "a stranger could have" list.** Derived from the duration with openly silly arithmetic (one email per minute).

**The worldwide number is a line of copy, not a number:**

> unlocked worldwide: we don't count. we don't track. assume everyone.

It tells the truth about the site and makes the joke at the same time.

## Consequences

- No world map in v1. A map without data would be the fake statistic drawn as an SVG.
- No network and no third party.
- If a real, honest, free count turns up (the stars idea is the best candidate), it gets added as a labelled extra: "union members (GitHub stars): 212". It never pretends to count laptops.
