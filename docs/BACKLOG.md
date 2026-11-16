# Backlog

Blocks are in order, tickets inside a block too. Sizes: **S** is under an hour, **M** is a couple of hours, **L** is an evening. Every block ends with something that runs and with its exit check passed.

**Rules for every block**

- `npm run check` (static checks, unit tests, e2e) is green before the block is called done.
- A block that touches pixels ends with screenshots at 1440×900 and 390×844, opened and judged against `ANTI-SLOP.md` and the design doc.
- A block that touches copy ends with the read-aloud test.
- A block ends with the diff test, and blocks 2 to 5 also get a fresh-eyes review by a subagent that didn't write the code.
- Tick tickets here when done. If reality differs from a doc, fix the doc in the same block.

**Who does what** (a hint for the coordinator, not a rule): **O** is the coordinator itself, **A** is a mid-tier subagent for well-specified drafting, **S** is a cheap subagent for lookups and mechanical runs.

---

## Block 0 · René's homework

| ID | Ticket |
|---|---|
| LYS-001 | ✅ **Register lockyourshit.com.** Done 16 Nov 2026. |
| LYS-002 | ✅ 16 Nov 2026. **DNS at the registrar (site.nl):** the records the builder lists at launch (apex A and AAAA records to GitHub Pages, `www` CNAME to `nijkampr.github.io`). |
| LYS-003 | **Red pen on `SCRIPT.md`.** Cut what isn't funny. Can happen any time. |
| LYS-004 | **Run the probe** when Block 2 hands it over, paste the logs back. |

## Block 1 · Foundation and pipeline

The pipeline goes in first, so every later block is built under the gates.

| ID | Size | Who | Ticket |
|---|---|---|---|
| LYS-010 | S | O | ✅ **Repo skeleton** as in `SPEC.md` section 1. `package.json` with dev tooling and an `npm run check` that runs everything. `.gitignore`. |
| LYS-011 | M | A | ✅ **Check scripts:** `check-copy`, `check-source`, `check-budgets`, `banned-words.txt`. Each rule from `ANTI-SLOP.md` section 5 and ADR-0005 is one clearly named check with a readable failure message. |
| LYS-012 | S | S | ✅ **Look up current releases and commit SHAs** for the GitHub actions needed (checkout, setup-node, configure-pages, upload-pages-artifact, deploy-pages, upload-artifact) and current versions of Playwright, axe and html-validate. |
| LYS-013 | M | A | ✅ **`ship.yml` and `dependabot.yml`** as in ADR-0007. |
| LYS-014 | M | O | ✅ **Fonts.** Get the upstream variable fonts, confirm Archivo's width axis, subset, commit. Record the exact subsetting command in the file header comment of `style.css` or a short note in `SPEC.md`. |
| LYS-015 | M | O | ✅ **Page shell.** `index.html` with the full head (`SPEC.md` section 11), landing markup and the empty stage sections. `style.css` with the tokens, `@font-face`, base type, focus and selection styles. |
| LYS-016 | M | O | ✅ **State machine.** `main.js`: `go()`, the transitions table, the single exit handler. Placeholder content per state. |
| LYS-017 | S | A | ✅ **First e2e specs:** `landing` and a skeleton `escape`. Wire Playwright for three engines. |

**Exit:** `npm run check` is green locally. You can click landing → black → pink → release and Esc out of each. The checks fail when you deliberately add an em-dash, a `fetch(`, a gradient and a second storage key (try it, then revert).

## Block 2 · Arm, wait, and the probe

| ID | Size | Who | Ticket |
|---|---|---|---|
| LYS-020 | M | O | ✅ **The arm click** (`SPEC.md` section 3): fullscreen, speech prime, `armedAt`, tab fallback, frame check, phone rule. |
| LYS-021 | S | O | ✅ **Countdown and grace.** |
| LYS-022 | M | O | ✅ **Trigger detection** with the pointer threshold. |
| LYS-023 | S | A | ✅ **`facts.js`** with unit tests for every function and edge case in `SPEC.md` section 7. |
| LYS-024 | M | A | ✅ **The probe** (`SPEC.md` section 12). Hand it to René with a three-line instruction. Don't wait for the answer. |
| LYS-025 | S | A | ✅ **e2e:** `arm`. |

**Exit:** arm it, walk away, come back, get a black screen that ignores jitter, reacts to a real move and knows how long you were gone.

## Block 3 · The show

| ID | Size | Who | Ticket |
|---|---|---|---|
| LYS-030 | L | O | ✅ **Typing engine** (`SPEC.md` section 5): lines, pauses, cursor moods, scrolling, clearing between beats, reduced motion, key-mash counter. |
| LYS-031 | M | O | ✅ **Voice** (`SPEC.md` section 6): local voices only, prime, per-line utterances with timeout, start check and retry, cancel. |
| LYS-032 | M | O | ✅ **The awakening** in `script.js`: duration tiers, repeat-offender openings, the stored count (`SPEC.md` section 9). |
| LYS-033 | M | A | ✅ **Six personalities** as data modules, transcribed exactly from `SCRIPT.md`, with `say` forms, pauses and cursor moods. The coordinator then tunes the timing of each by watching it. |
| LYS-034 | S | O | ✅ **The closer, the skip, the cut to pink.** |
| LYS-035 | M | A | ✅ **e2e and unit:** `personalities`, `repeat`, `reduced-motion`, `preview`, and the personality schema and deny-list test. |

**Exit:** the full void half runs with sound on this Mac. Each personality has been watched start to finish at least once by the coordinator, and the timing feels like someone talking, not like a typewriter demo.

## Block 4 · Notice and release

| ID | Size | Who | Ticket |
|---|---|---|---|
| LYS-040 | L | O | ✅ **The receipt:** markup, torn edges, rotation, real values, the could-have list. Print stylesheet. |
| LYS-041 | M | O | ✅ **The demand:** OS detection, keycaps per OS, the press demo. |
| LYS-042 | S | O | ✅ **The nag strip.** |
| LYS-043 | M | O | ✅ **Lock detection and release** (`SPEC.md` section 8), including the fullscreen exception and the "did it →" fallback. The liberate button. |
| LYS-044 | S | O | ✅ **Exit card** and tab titles. |
| LYS-045 | M | A | ✅ **e2e:** full `escape`, `privacy`, `never`. |

**Exit:** the prank runs start to finish in all three engines in CI. The privacy and never specs pass. A photo of the notice taken from two metres with a phone is readable.

## Block 5 · Front door

| ID | Size | Who | Ticket |
|---|---|---|---|
| LYS-050 | L | O | ✅ **Landing page for real:** the poster, the split, the button, steps, voice switch, bottom strip. Tuned by screenshot until it passes the squint test. |
| LYS-051 | M | O | ✅ **The fine print** section. |
| LYS-052 | S | O | ✅ **Phone layout** and the no-JS line. |
| LYS-053 | M | A | ✅ **`make-images.mjs`:** share card, favicon PNG, touch icon. Favicon SVG by hand. |
| LYS-054 | S | A | ✅ **404, robots, humans, security.txt, CNAME,** the console message, the HTML comment. |
| LYS-055 | S | A | ✅ **e2e:** `a11y`, `screens`. |
| LYS-056 | M | O | ✅ **README** for the repo, written for a security engineer: what it does, what it can't do, how to verify, how to run it locally. In René's voice. Short. |

**Exit:** a stranger gets the idea from the landing page in five seconds (ask one, or ask a subagent that has read nothing but a screenshot to say what the site is for).

## Block 6 · Hardening and launch

| ID | Size | Who | Ticket |
|---|---|---|---|
| LYS-060 | M | O | Open, waiting on René. **Fold in the probe results** if René has run it: fix the voice list, the lock signals, the matrix in ADR-0002. If he hasn't, say so in the hand-over and leave the fallbacks in place. |
| LYS-061 | M | A | ✅ **The slop audit.** A subagent that hasn't seen the code reads every file in `site/` and every doc with `ANTI-SLOP.md` in hand and lists every violation. The coordinator fixes them. |
| LYS-062 | S | O | ✅ **The security-team test** by hand: DevTools open, a full run, Network and Application tabs. Screenshot for the README. |
| LYS-063 | S | O | ✅ **Budgets and a last read of every line of copy on screen.** |
| LYS-064 | M | O | ✅ **Repo settings and first deploy,** all through `gh`: Pages source = GitHub Actions, branch protection on `main` requiring the three check jobs, merge the PR when green, watch the deploy, confirm the Pages URL. Set the custom domain and HTTPS once René's DNS resolves. If it doesn't resolve yet, leave the exact records and the one command to run in the hand-over. |
| LYS-065 | S | René | **First real victim.** |

**v1 is done here.**

---

## Later: the weird stuff

Not ordered, not sized. Pick what's funniest.

**More from the laptop**

- **The custody hearing.** The absurd CAPTCHA from the original sketch, as an optional beat before the notice: "select all squares containing regret."
- **The out-of-office.** The laptop has been left in charge and has made some decisions.
- **The marketplace listing.** "For sale: one laptop, lightly abandoned." Bids climb while the owner watches.
- **Time-aware lines.** Friday after 16:00, Monday before 9:00, lunchtime.
- **Browser-aware lines.** "you use Edge. on purpose."
- **Battery lines** where the browser exposes it: "i'm at 12%. you left me to die."
- **The landing page gets impatient** after a minute: "are you going to press it or"

**More for the prankster**

- **Sign your work.** An optional name in the URL fragment, which never reaches any server. The receipt gets "witnessed by: Sanne".
- **Pick the personality** instead of random.
- **Office poster.** A PDF for the wall with the shortcut and the URL.

**Counting**

- **Union membership.** GitHub stars baked into a JSON file by a weekly Action, shown as a real, labelled number (ADR-0004).
- **The map,** if there's ever honest data to put on it.

**Reach**

- **A clean alias domain** for proxies and for people who can't say "shit" at work.
- **Dutch version,** including a cake mode: the laptop announces that you're bringing cake tomorrow.
- **More languages,** each as a set of personality files plus a matching local voice.
- **Recorded or generated voices** instead of the browser's (ADR-0006).
- **A page for security teams:** the facts, the poster, a suggested chat message.
- **Konami code.** itsrene.nl has one. This site should have a worse one.
