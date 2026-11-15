# The Anti-Slop Contract

René hates AI slop. This site is built by an AI. Both are true, so this file exists.

**The rule:** if a reviewer can tell at a glance that a machine made it, it's wrong, even when it works. This applies to the design, the copy, the code, the docs and the commit messages. A change that breaks this contract is rejected, including when the builder is an AI and the tests are green.

Where a rule can be checked by a script, CI checks it (`ADR-0007`). The rest is checked by looking, which is why the build has screenshot reviews.

## 1. Design slop

The look is specified in `design/DESIGN-DIRECTION.md`. These are the things that are **never** the answer, whatever the problem is:

- Gradients, glows, `box-shadow`, `text-shadow`, blur, glass, noise textures.
- Rounded cards, pills, badges, chips. Corners are square. The only radius on the site is 2px on the keycaps.
- A centred hero with a subtitle and three feature cards under it. The landing page is a poster with an asymmetric split, not a SaaS page.
- Emoji anywhere in the UI. Icon fonts. Icon libraries. Stock illustration. A mascot.
- Purple. Blue. Red. Green. A second accent of any kind. Opacity tints of the pink used as "a lighter pink".
- Fade-ins, slide-ups, scroll reveals, parallax, hover lifts, easing curves. State changes are cuts. The only things that move are the typing, the cursor and the keycap demo.
- Glitch effects, matrix rain, scanlines, terminal green, fake boot logs. It is the cliché and it reads as malware.
- Fake OS chrome: window frames, title bars, system dialogs, progress bars, spinners.
- "Dark mode toggle", cookie banners, newsletter boxes, social icons, a footer with four columns.
- Default system look anywhere: unstyled buttons, blue links, default focus rings, default selection colour.
- Centre-aligned body text. Text on the pink in any colour but black.

**The squint test:** from across the room the landing page reads as a strike poster and the void reads as a screen that's off or a terminal with one line on it. If it reads as a startup landing page, start over.

**The screenshot rule:** nobody signs off a screen they haven't looked at. Every block that touches pixels ends with real screenshots (1440×900 and 390×844) that the builder opens and checks against this list and the design doc.

## 2. Copy slop

All text a human reads follows René's style guide (`~/projects/bob-repo/instructions/skills/blog-writing.skill.md`). Load it before writing a single line. The short version:

- **No em-dashes or en-dashes. Anywhere.** Site, docs, comments, commits. CI greps for U+2014 and U+2013 and fails. (Written as code points here so this file passes its own check.)
- **Banned words** live in `scripts/banned-words.txt` and CI fails on them in shipped copy: seamless, robust, leverage, utilize, delve, empower, elevate, game-changer, cutting-edge, pivotal, crucial, testament, tapestry, "smoking gun", "at the end of the day", "it's worth noting", "let that sink in". Add to the file when René flags a new one. ("Unlock" as a marketing verb is banned too, but by eye: the word "unlocked" is half this site, so a script can't tell.)
- **No fake punches.** No "That's the point." No "And that's why it works." If deleting a fragment loses no information, delete it.
- **No "it's not X, it's Y" scaffolding.**
- **No explaining the joke.** If a line needs a second line to say why it's funny, cut both.
- **No exclamation marks** in the laptop's voice. It is calm. The union shouts with type size, not punctuation. (`OH.` has a full stop.)
- **No "Oops!", "Uh oh!", "Whoops", "Busted!", "Gotcha!"** The site never sounds like a mobile game.
- **No puns on "lock"** beyond the name. No "unlock your potential" jokes, no key emoji, no "security is key".
- **No lecture.** The words "cybersecurity", "best practice", "awareness" and "remember to always" don't appear in the prank.
- **Specific beats generic.** "accepted every meeting invite. you're busy until 2031." is a joke. "did some crazy stuff with your files" is filler.

**The panic rule** (from the brief) also lives here: the laptop never claims anything a real attacker would plausibly do. The words password, upload, transfer, payment, bank, wire, encrypt, ransom, hacked, virus, malware, leaked, exfiltrate and "sent your" (files, data) are on a deny-list that a unit test runs over every personality.

**The read-aloud test:** read every line out loud in a flat voice. If it sounds like a brand trying to be funny on social media, cut it.

## 3. Code slop

The code is part of the product. A security engineer will read it, and it should look like one careful person wrote it.

- **No comments that narrate.** `// increment counter` above `count++` is slop. Comments explain why, or warn. The top of each file gets a few lines saying what it's for. That's all.
- **No JSDoc walls, no banner comments, no ASCII dividers, no "Section: Helpers".**
- **No abstraction with one caller.** No `utils.js`, no `helpers.js`, no `constants.js` with three numbers in it, no config object for things that are never configured, no event bus, no classes where a function does it.
- **No defensive code for things that can't happen.** `try/catch` only where something can really throw at a boundary we don't control: storage, speech, fullscreen. Never around our own functions.
- **No dead code, no commented-out code, no TODOs, no `console.log`.** The one console message is the deliberate hello to whoever opens DevTools (`SPEC.md`).
- **No dependencies in `site/`.** No polyfills. No library for something the platform does.
- **No clever.** A reader with ten minutes should be able to follow `main.js` top to bottom.
- **Names say what things are.** `armedAt`, `goneFor`, `pickVoice`. Not `data`, `handler2`, `processStuff`, `manager`.
- **CSS:** custom properties for the five colours and nothing else. No utility classes, no BEM novels, no `!important`, no vendor prefixes we don't need, no reset bigger than it has to be.
- **HTML:** semantic, short, no div soup, no `aria-*` where a real element does the job.
- **Tests test behaviour a user or a security team cares about.** No snapshot of the whole DOM, no test that restates the implementation.

**The diff test:** before a block is done, read the whole diff once as a hostile reviewer. Anything you'd be embarrassed to explain goes.

## 4. Docs and commit slop

- Docs say what was decided and why, in René's voice. No "This document outlines". No summary of the summary.
- No status reports, changelogs or "implementation notes" files unless René asks. The backlog gets ticks, the ADRs get updated when reality differs.
- Commit messages: one imperative line saying what changed, a short body only if the why isn't obvious. No bullet-point essay, no "This commit", no emoji.
- An ADR that turned out wrong gets corrected or superseded, not left to rot.

## 5. How it's enforced

| Check | Where |
|---|---|
| Dashes, banned words | `scripts/check-copy.mjs`, CI |
| Panic-rule deny-list | unit test over all personalities, CI |
| Forbidden CSS (`gradient`, `box-shadow`, `text-shadow`, `border-radius` over 2px, `transition`, `filter`, `!important`) | `scripts/check-source.mjs`, CI |
| Colours: only the five tokens appear as colour values | `scripts/check-source.mjs`, CI |
| No `console.log`, no TODO, no external URLs, no never-list APIs | `scripts/check-source.mjs`, CI |
| Size budgets | `scripts/check-budgets.mjs`, CI |
| Does it look like slop | Screenshots, opened and judged by the builder at every block exit, and by René before launch |
| Does it read like slop | The read-aloud test, by the builder. René's red pen on `SCRIPT.md`. |
| Does the code read like slop | The diff test, plus one fresh-eyes review by a subagent that didn't write it |
