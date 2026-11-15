# ADR-0003: Esc always works, and the release is the lock shortcut

**Status:** Proposed · 2026-11-15, updated 2026-11-16

## Context

"A prank, not a hostage situation." The owner has to be able to get out at any moment, without reading anything. Separately, the prank needs an ending, and the ending should be the lesson.

## Decision

### Esc is guaranteed by the browser, and we keep it that way

In fullscreen, desktop browsers reserve Esc to leave fullscreen. A page can only change that with the Keyboard Lock API, which exists in Chromium only. **We never call it,** and CI fails if the name appears in the source. So the guarantee doesn't depend on our code being bug-free.

Our side of it:

- Losing fullscreen and pressing Esc in tab mode both end in the single exit handler (`SPEC.md` section 2): speech off, timers cleared, cursor back.
- While arming or armed, Esc disarms and returns to the landing page.
- From beat 1 onward, `esc = leave` is visible in a corner and is a real button.
- A second control, `→ = get to the point`, skips the laptop's monologue and goes to the notice. Repeat audiences have seen the show.
- The exit card is quiet: two lines from the laptop, the shortcut, a way back.

### The page never traps

No `beforeunload` prompt, no history tricks, no reopening, no popups, no "are you sure". Closing the tab, Cmd+W, Alt+F4 and the back button work as they always do.

### The release: press the lock shortcut

The notice ends with the one demand, drawn as keycaps for the detected OS:

| OS | Shortcut |
|---|---|
| macOS | ⌃ ⌘ Q |
| Windows | Win + L |
| ChromeOS | Search + L |
| Linux | Super + L (most desktops) |

The victim presses it and the OS locks the machine. We don't lock anything and can't. The user does it with their own keyboard, which is the entire point of the site.

**Noticing it afterwards is best effort.** The page can't see the shortcut. It watches for side effects (page hidden, window blurred, a gap in a heartbeat timer) and shows the release screen when the page comes back. Which of those fire on which browser is unknown until the probe runs (ADR-0002).

**So there is always a manual way:** a small `did it →` link under the demand goes to the release screen. If detection fails everywhere, the prank still ends properly with one click.

## Alternatives rejected

- **The absurd CAPTCHA as the v1 ending.** Funny, but a whole extra UI that teaches nothing. Backlog.
- **"Hold Esc to exit" or any delayed exit.** Makes leaving harder. Out.
- **The Idle Detection API,** which can report a locked screen. It needs a permission prompt and is Chromium-only. A permission prompt on someone else's laptop is out.

## Consequences

- The escape guarantee holds even if our JS throws halfway through.
- The ending builds the muscle memory the site exists for.
- Switching windows for a few seconds during the notice can look like a lock, and the release screen shows early. Accepted.
- OS detection can be wrong. Unknown systems get all the shortcuts, small and labelled.
