# Build Spec

What to build, precisely enough to build it without guessing. Where this file and another doc disagree, this file wins for behaviour, `SCRIPT.md` wins for words, `design/DESIGN-DIRECTION.md` wins for looks. If something is missing here, pick the smallest thing that fits the brief and write the choice into this file.

## 1. Repo layout

```
site/                         everything that ships, exactly as it ships
  index.html                  landing page + the hidden stage
  404.html
  css/style.css
  js/main.js                  boot, state machine, the single exit handler
  js/run.js                   every timer, listener and wait a run starts, so one call stops all of it
  js/arm.js                   the arm click, countdown, trigger detection
  js/stage.js                 the typing engine for the void
  js/voice.js                 speech: pick a voice, say a line, shut up
  js/notice.js                receipt, demand, lock detection, release
  js/facts.js                 pure functions: durations, tiers, could-have list, OS, tokens
  js/script.js                the shared lines: awakening, closer, nags, release, exit
  js/personalities/index.js   imports and lists the personalities
  js/personalities/<id>.js    one file per personality
  fonts/archivo.woff2
  fonts/jetbrains-mono.woff2
  img/favicon.svg  img/favicon-32.png  img/apple-touch-icon.png  img/card.png
  img/tear.svg                the receipt's torn edge, preloaded so the notice needs no request
  robots.txt  humans.txt  CNAME
  .well-known/security.txt
tests/
  unit/*.test.js              node:test, no dependencies
  e2e/*.spec.js               Playwright, with e2e/helpers.js for the shared steps
  manual/probe.html           the hardware probe (section 12), never shipped
scripts/
  check-copy.mjs  check-source.mjs  check-budgets.mjs
  banned-words.txt
  make-images.mjs             renders the share card and icons with Playwright
docs/
.github/workflows/ship.yml
fonts-src/                    the font licences (OFL)
playwright.config.js  .htmlvalidate.json
.github/dependabot.yml
package.json                  dev tooling only. nothing in site/ depends on it.
```

**Fonts** are made once on a dev machine from the upstream variable fonts in google/fonts (licences in `fonts-src/`) with fontTools:

```
fonttools varLib.instancer "Archivo[wdth,wght].ttf" wght=900 wdth=62 -o archivo-900-62.ttf
fonttools varLib.instancer "JetBrainsMono[wght].ttf" wght=400:700 -o jbm-400-700.ttf
pyftsubset <each> --unicodes="U+0020-007E,U+00A0-00FF,U+2018-201F,U+2026,U+2022,U+00B7,U+2190-2193,U+2303,U+2318" \
  --flavor=woff2 --name-IDs='*' --layout-features='kern,liga'
```

JetBrains Mono carries `⌃` and `⌘`, so the Mac keycaps use it instead of the system font.

All URLs inside `site/` are **relative** (`./css/style.css`), so the site works at `nijkampr.github.io/lockyourshit.com/` before the domain exists. The exception is `404.html`, which is served from any path and uses root-relative URLs.

`facts.js` and the personality files must import nothing from the DOM, so the unit tests can load them in plain Node.

## 2. States

One attribute, `data-state` on `<html>`, decides what is visible. CSS shows the matching section and hides the rest. One function, `go(state)`, changes it. No router, no framework, no event bus.

| State | Screen | Fullscreen |
|---|---|---|
| `landing` | The poster and the fine print | no |
| `arming` | "armed. walk away." and the countdown | yes, if granted |
| `armed` | Pure black, no cursor | yes, if granted |
| `awake` | The void: beats 1 and 2 | yes, if granted |
| `notice` | Pink: receipt and demand | yes, if granted |
| `released` | The void: release lines and the liberate button | yes, if granted |
| `exited` | The exit card | no |

**Transitions**

| From | Event | To | Notes |
|---|---|---|---|
| `landing` | click "arm this laptop" | `arming` | Does everything in section 3 |
| `landing` | click "try it on yourself first" | `awake` | Preview mode, section 10 |
| `arming` | countdown ends (3 s) | `armed` | |
| `arming`, `armed` | Esc or fullscreen lost | `landing` | Silent disarm |
| `armed` | trigger (section 4) | `awake` | `goneFor` is fixed here |
| `awake` | last line of the closer finishes | `notice` | Hard cut |
| `awake` | Right arrow, or click on the skip hint | `notice` | Speech is cancelled |
| `awake`, `notice` | Esc, click on the esc hint, or fullscreen lost | `exited` | See the lock exception in section 8 |
| `notice` | lock detected and the page is back, or click "did it →" | `released` | |
| `released` | Esc, fullscreen lost, or click "back to the front door" | `landing` | |
| `exited` | click "back to the front door" | `landing` | |

**The single exit handler.** Leaving for `exited` or `landing` always runs the same function: cancel speech, clear every timer, leave fullscreen if still in it, show the cursor again, then `go(...)`. Every listener and timer the prank starts is registered so this function can remove it. After it runs, nothing is ticking.

**How a run stops** (`run.js`). A run is an `AbortController`. `begin()` starts one, `stop()` aborts it, and every `wait()`, interval and listener a run creates is tied to it. A stopped run stays aborted until the next `begin()`, so a sequence that wakes up after its run stopped hits a rejected `wait()` and ends. Promises `run.js` didn't create (speech) go through `guard()`, which rejects when the run stops. Without that, a cancelled utterance resolves after the next run has begun and the old monologue carries on inside the new one (found on macOS, where headless Chromium has real voices).

**Esc arrives twice in fullscreen:** the browser leaves fullscreen and also delivers the keydown. `leave()` ignores both in `landing` and `exited`, so the exit card isn't thrown away by the second one. Esc on the exit card does nothing. The exit card is already out of fullscreen and has a link back.

## 3. The arm click

Everything here happens synchronously inside the click handler, because that is when the browser lets us.

1. `stage.requestFullscreen()` if it exists. A rejection or a missing API is fine: the prank runs in the tab. Don't use prefixed variants.
2. Prime speech (section 6): one utterance with real text at `volume = 0`.
3. `armedAt = Date.now()`.
4. `go('arming')`.

The voice switch on the landing page is read here. If it's off, step 2 is skipped and the voice module stays silent for the run.

**Don't arm when framed.** If `window.top !== window.self`, the arm and preview buttons are replaced with a plain link to the real URL.

**Don't arm on phones.** If `matchMedia('(pointer: coarse)')` matches and the viewport is under 900 px wide, the arm button is not rendered and the phone line from `SCRIPT.md` is shown. The preview stays.

## 4. Waiting and the trigger

- `arming` lasts 3 seconds: the two lines, then `3`, `2`, `1`, one per second.
- `armed` shows `#000` and `cursor: none` on everything.
- **Grace:** for the first 5 seconds of `armed`, all input is ignored.
- **Trigger,** after grace, any one of:
  - `keydown` for any key except Escape,
  - `pointerdown` or `touchstart`,
  - pointer travel of 30 px or more (sum of `|dx| + |dy|`) inside any 500 ms window.
- On trigger: `goneFor = Date.now() - armedAt`. Wall clock, never tick counting.
- If the tab is hidden when a trigger would fire, ignore it.

No Wake Lock, no audio and no timers beyond the grace timeout while armed (ADR-0002).

## 5. The void: typing engine

`stage.js` plays a list of lines into the void and resolves when done.

**A line** is a plain object:

```js
{
  text: 'you were gone for {duration}.',  // required. tokens allowed. whitespace is kept.
  say: 'spoken form',                      // optional. '' means the voice skips this line.
  pause: 500,                              // ms of quiet after the line. default 500.
  cps: 28,                                 // characters per second. default 28.
  before: 'think' | 'still' | 'stutter',   // what the cursor does before typing. optional.
}
```

A `(pause)` in the script is a line with empty `text` and a `pause` of about 1000.

**Playing a line:**

1. Run the `before` behaviour if set: `think` blinks for 800 ms, `still` holds solid for 1200 ms, `stutter` blinks fast three times.
2. Start speaking the line (section 6) and start typing it, at the same moment.
3. Typing adds one character per tick at `cps`. After `.` `?` `:` wait an extra 220 ms, after `,` an extra 120 ms.
4. The line is done when typing has finished **and** speech has ended or timed out. Then wait `pause`.

**Layout behaviour:** lines stack top to bottom. When they would pass the bottom of the text area, the area scrolls so the newest line is always visible. No scrollbar. The cursor sits at the end of the newest line.

**Beats:** the screen is cleared between the awakening, the personality and the closer.

**Reduced motion:** each line appears whole. Hold it for `max(900, characters × 45)` ms, or until speech ends, whichever is later. The cursor doesn't blink.

**Key mashing:** the engine counts key presses during `awake`. At six, it queues the key-mash line from `SCRIPT.md` to play once after the current line.

**Keys are counted, never read.** There is exactly one `keydown` listener in the codebase. It compares `event.key` to `'Escape'` and `'ArrowRight'` and otherwise only increments a number. No key value is stored, logged or put on screen. This matters to the people who will read this code, so the listener carries a comment saying so.

## 6. Voice

Background: what browsers do here is partly unverified (ADR-0006), so every step has a fallback and the fallback is always silence plus text.

- **Voices:** read `speechSynthesis.getVoices()` on load, on `voiceschanged`, and by polling every 250 ms for up to 2 s (some Safari versions never fire the event).
- **Only on-device voices.** Keep voices where `localService === true` and `lang` starts with `en`. Remote voices send the text to a server, which would break ADR-0005. If no local English voice exists, the run is silent.
- **Preference:** the first match from this list by name prefix, else the first local English voice: `Samantha`, `Daniel`, `Alex`, `Microsoft Zira`, `Microsoft David`, `Microsoft Mark`. (The list gets corrected from probe results.)
- **Prime:** in the arm click, speak the word "armed" with `volume = 0`.
- **Base settings:** `rate 0.92`, `pitch 1`, `volume 1`. Each personality carries `voice: { rate, pitch }`, which replace the base for its lines.
- **One utterance per line.** The spoken text is `say` if present, else `text`, with tokens filled in, lowercased, brackets and repeated spaces removed.
- **End of a line's speech** is the utterance's `end` or `error` event, or a timeout of `characters × 90 + 2000` ms, whichever comes first. Never wait on `boundary` events.
- **A silent run resolves every line's speech at once.** Voice off, no local voice, or blocked: `say()` returns a resolved promise and the typing sets the pace. This also keeps headless test runs fast.
- **If the first utterance of `awake` produces no `start` event within 3000 ms,** speech is assumed blocked. Try once more on the victim's next key press or click (that is a real gesture). If that fails as well, stay silent for the run.
- **Stopping:** `speechSynthesis.cancel()`. When speaking again right after a cancel (the skip to the notice), wait 100 ms first.
- Everything in this module that touches `speechSynthesis` is inside `try/catch`. A throw means silence.

## 7. Facts (`facts.js`)

Pure functions. All of them have unit tests.

**`clock(ms)`** → `0:40`, `14:32`, `1:04:09`. Minutes are not zero-padded under an hour.

**`spoken(ms)`**

| Range | Form |
|---|---|
| under 60 s | `40 seconds` |
| under 1 h | `14 minutes and 32 seconds` (drop "and 0 seconds", singular for 1) |
| 1 h and over | `1 hour and 4 minutes` (drop "and 0 minutes", singular for 1) |

**`tier(ms)`** → `seconds` (under 60 s), `minutes` (under 1 h), `hours` (under 8 h), `overnight`.

**`couldHave(ms)`** → the list for the receipt. With `m` = whole minutes:

| Condition | Line |
|---|---|
| `m < 2` | `sent one email as you. one is enough.` |
| `m >= 2` | `sent {m} emails as you` (cap the number at 999) |
| `m >= 2` | `approved their own pull request` |
| `m >= 5` | `changed your photo to a horse` |
| `m >= 15` | `booked the big meeting room. forever.` |
| `m >= 30` | `ordered {floor(m / 2)} pizzas to reception` (cap at 400) |
| `m >= 60` | `resigned on your behalf. politely.` |
| `m >= 480` | `lived your whole day better than you did` |

Show the email line plus the last four that apply.

**`os()`** → `mac`, `windows`, `chromeos`, `linux` or `unknown`, from `navigator.userAgentData.platform` when present, else `navigator.platform` and the user agent. A "Mac" with `maxTouchPoints > 1` is an iPad and counts as `unknown`.

**`keys(os)`** → the keycap labels and the `{keys}` phrase: mac is `⌃ ⌘ Q` and "three keys". Windows is `WIN L`, ChromeOS is `SEARCH L`, Linux is `SUPER L`, all "two keys". Unknown shows all four rows, small and labelled, and says "two keys".

**`fill(text, facts)`** → replaces `{duration}`, `{clock}`, `{keys}` and `{count}`.

## 8. The notice and the release (`notice.js`)

**Build the receipt** from `goneFor`, the time of arming (`sun 15 nov 2026` and `14:07`, fixed English and 24-hour, because a receipt doesn't localise), the offence count and `couldHave()`. Layout is in the design doc, words in the script.

**The nags** from `SCRIPT.md` play on the black strip at 4 s, 25 s and 50 s, with voice. Each is typed by the same engine.

**Lock detection.** The page can't see the shortcut. While in `notice` it watches for the side effects, and any one of them arms a "probably locked" flag:

- `visibilitychange` to hidden,
- `window` `blur` that lasts 2 s or more,
- a 1 s heartbeat (`setInterval`) that notices 5 s or more passed between two ticks.

When the flag is set and the page is visible and focused again, `go('released')`.

**The lock exception for fullscreen.** If fullscreen ends while in `notice`, wait 600 ms before deciding. If the page is hidden or unfocused by then, the OS probably dropped fullscreen because of the lock: set the flag and wait for the return, as above. Otherwise it was Esc: go to `exited`.

**The honest fallback:** the `did it →` link under the demand always goes to `released`. If detection never fires on some browser, the victim logs in, sees the notice, clicks.

A false positive (someone switches windows for a few seconds and comes back to the release screen) is accepted.

**Release:** play the release lines in the void, then show the URL and the liberate button. The button calls `navigator.clipboard.writeText('https://lockyourshit.com')` inside its click and changes its label for 2 s. If the clipboard call fails, select the URL text instead.

## 9. The one stored number

- Key: `lys.caught`. Value: an integer as a string. Nothing else is ever stored, anywhere.
- It is incremented once per real run, when `awake` starts. Preview runs don't read or write it.
- `{count}` is the value after incrementing.
- Reading and writing are wrapped in `try/catch`. If storage is blocked, the count is 1 and nothing is written.
- `localStorage` appears in exactly one file (`main.js`), and CI checks that.

## 10. Preview mode

"Try it on yourself first" runs the real thing with three differences:

- no countdown and no wait: straight to `awake`,
- `goneFor` is fixed at 14 minutes 32 seconds,
- a small mono label sits top right through the whole run: `preview · on a real victim this is their real time away`.

It requests fullscreen like the real run where that exists, and doesn't touch storage.

## 11. Page furniture

**`index.html` head**

- The HTML comment from `SCRIPT.md` as the first thing in the file.
- `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'">` exactly. No inline scripts, no inline styles, no `style` attributes in markup. Setting `element.style` from JS is expected to be allowed under this policy. An e2e test asserts zero CSP violations, so if a browser disagrees we find out and switch to toggling classes.
- `<meta name="referrer" content="no-referrer">`, `<meta name="color-scheme" content="dark">`, viewport, `theme-color` pink.
- Title, description, Open Graph and Twitter card tags with absolute `https://lockyourshit.com/...` URLs (the one place absolute URLs are allowed).
- Font preloads for both fonts, the stylesheet, `<script type="module" src="./js/main.js">`.

**Absolute URLs.** The external-URL check allows exactly two things in `site/`: `https://lockyourshit.com/...` (meta tags, the liberate button, `CNAME`-related files) and `https://github.com/nijkampr/lockyourshit.com` (the source link, the console message, `security.txt`). Anything else fails CI.

**Accessibility**

- Landing page: real headings, a real `<button>`, visible focus, works by keyboard alone.
- The void's text area is `aria-live="off"`: when the voice is on a screen reader shouldn't double it, and the lines stay in the DOM as text for anyone who reads back.
- The esc and skip hints are real buttons.
- Contrast: only the pairs listed in the design doc are used.

**Other files**

- `robots.txt`: allow everything.
- `humans.txt`: from the script.
- `.well-known/security.txt`: `Contact:` the repo's security advisory URL, `Expires:` under a year out, `Preferred-Languages: en, nl`, plus the comment line from the script. CI fails when `Expires` is under 30 days away.
- `CNAME`: `lockyourshit.com`.
- The console message from the script, logged once on load with `console.info`.

**Images** are produced by `scripts/make-images.mjs`, which renders small local HTML templates with Playwright and writes PNGs into `site/img/`. The outputs are committed. The share card is 1200×630: the pink poster with the stacked headline and the top-bar annotation.

## 12. The hardware probe

Some browser behaviour can't be settled from docs or from headless tests: whether a silent prime keeps Safari's speech allowed, which voices are local, what a real screen lock looks like to a page, and whether fullscreen survives it.

`tests/manual/probe.html` is a plain page for René to open on real machines (served from `python3 -m http.server`, not shipped). It has one button and a log on screen:

1. On click: request fullscreen, prime speech silently, list the voices with their `localService` flag.
2. After 10 s without any click: try to speak one line, and log whether `start` and `end` fired.
3. Log every `visibilitychange`, `blur`, `focus`, `fullscreenchange` and heartbeat gap with a timestamp, so René can press the lock shortcut, log back in and read what happened.
4. A "copy log" button.

René runs it on Chrome, Safari and Firefox on his Mac and on whatever Windows machine he can borrow, and pastes the logs. The results go into the matrix in ADR-0002, and sections 6 and 8 get corrected if reality differs. The spec is built so that nothing blocks on this: every unknown already has a fallback.

## 13. Tests

**Unit** (`node --test tests/unit`): every function in `facts.js` including edge cases (0 ms, 59 999 ms, exactly 1 h, 23 h), token filling, and one test that loads every personality and checks: unique id, at least four lines, every line has `text`, the panic-rule deny-list from `ANTI-SLOP.md` doesn't match, no dashes, no exclamation marks.

**End to end** (Playwright, on Chromium, Firefox and WebKit). Time is driven with Playwright's clock, and `Math.random` is pinned from the test, so there are no test hooks in the shipped code.

| Spec | Proves |
|---|---|
| `landing` | Renders, no console errors, zero CSP violations, keyboard reaches the arm button |
| `arm` | Click → countdown → black. Input during grace does nothing. Small pointer jitter does nothing. A real move triggers. The duration on the receipt matches the time advanced |
| `escape` | Esc from every state lands in the right place, speech was cancelled, no timer is left running |
| `privacy` | From network idle after load to the end of a full run: zero network requests, no cookies, no sessionStorage, no IndexedDB, and localStorage holds exactly one key |
| `never` | The never-list APIs (ADR-0005) are wrapped by the test before load and none was called |
| `preview` | Runs without the wait, shows the label, writes nothing |
| `personalities` | Each personality plays to the notice |
| `repeat` | Second and fifth run show the repeat-offender lines and the right count |
| `reduced-motion` | The run completes with lines appearing whole |
| `a11y` | axe finds no violations on landing, notice, exit card and 404 |
| `screens` | Not a gate. Saves screenshots of every screen at 1440×900 and 390×844 as a CI artifact for the slop review |

Headless browsers may refuse fullscreen and have no voices. The tests accept both, which also exercises the tab fallback and the silent path.

## 14. Defaults in one place

| Thing | Value |
|---|---|
| Countdown | 3 s |
| Grace | 5 s |
| Pointer trigger | 30 px in 500 ms |
| Typing | 28 cps, +220 ms after `. ? :`, +120 ms after `,` |
| Default pause after a line | 500 ms |
| Speech rate / pitch | 0.92 / 1 |
| Speech timeout per line | chars × 90 + 2000 ms |
| Speech start check | 3000 ms (1500 cut off slow first utterances in review) |
| Blur counts as lock after | 2 s |
| Heartbeat gap counts as lock after | 5 s |
| Fullscreen-exit decision delay in `notice` | 600 ms |
| Nags | 4 s, 25 s, 50 s |
| Preview duration | 14:32 |
| Storage key | `lys.caught` |
