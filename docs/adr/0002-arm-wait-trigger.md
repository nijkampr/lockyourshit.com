# ADR-0002: Arm, wait, trigger

**Status:** Proposed · 2026-11-15, updated 2026-11-16

## Context

Browsers only allow fullscreen and (mostly) speech after a user gesture. The victim's first mouse move is not a gesture in the browser's eyes. The prankster's click on the arm button is. So everything the prank needs has to be unlocked in that one click and held until the owner comes back.

## Decision

The exact numbers and steps are in `SPEC.md` sections 3 and 4. The decisions behind them:

**One click unlocks everything.** Fullscreen is requested and speech is primed inside the arm click handler. If fullscreen is refused or missing, the prank runs in the tab. Fullscreen is an upgrade.

**A countdown, then a grace period.** The prankster gets 3 seconds of "walk away" and then 5 seconds in which the black screen ignores input, so their own hand leaving the trackpad doesn't set it off.

**The armed state is true black and nothing else.** It passes for a display that went to sleep. No fake desktop, no fake screensaver. We can't see the real desktop (that needs screen capture and a permission prompt, which is out) and we don't need to. A dark screen has one universal response, and that response is the trigger.

**The trigger is the first deliberate input:** a key, a click, or pointer travel above a threshold so a bumped desk doesn't count.

**Time is measured on the wall clock,** so it stays right when the machine slept in between.

**No Wake Lock.** We could stop the screen from dimming and the machine from auto-locking. We don't. If the laptop locks itself while armed, the laptop did the right thing and the prank waits behind the login screen or is over. A page that keeps an unattended machine unlocked for longer is the opposite of the message, and it's the kind of thing that gets a domain blocked.

## What we know and what we don't

I had the browser behaviour researched on 16 Nov 2026. Most of it could not be confirmed from primary sources, so this table separates fact from expectation. **The probe (`SPEC.md` section 12) settles the open rows on real hardware.** Every open row already has a fallback in the spec, so the build doesn't wait for it.

| Question | Status | If it goes the wrong way |
|---|---|---|
| Fullscreen needs a click | Confirmed (MDN) | n/a, we have the click |
| Esc exits fullscreen and a page can't stop it without Keyboard Lock | Confirmed. Keyboard Lock is Chromium-only and we never call it | n/a |
| Safari on macOS has unprefixed fullscreen | Reported since 16.4, medium confidence | Runs in the tab |
| iPhone has element fullscreen | Unreliable. Treated as no | Phones don't arm anyway |
| Chrome and Edge: one earlier click keeps `speak()` allowed | Reported as sticky, medium confidence | Speech starts at the victim's first key or click, else text only |
| Safari: a silent utterance in the click keeps later speech allowed | **Unknown** | Same fallback |
| Firefox has no gesture rule for speech | Expected, unverified | Same fallback |
| `mousemove` fires with a hidden cursor and after display wake | Expected, unverified | Keys and clicks still trigger |
| What a page sees when the OS locks | **Unknown** | The "did it →" link (ADR-0003) |
| Fullscreen survives a lock and unlock | **Unknown** | Handled both ways (`SPEC.md` section 8) |
| The browser's "press Esc to exit" notice | Shown on entry for a few seconds. Only the prankster sees it | n/a |

## Consequences

- The prankster has about 8 seconds between click and live trigger.
- If the owner comes back during the grace period, they see a black screen that ignores them briefly. Acceptable.
- A machine that auto-locks in 5 minutes makes long pranks impossible there. That's the policy working.
- Speech is the least predictable part, which is why ADR-0006 makes it a bonus.
