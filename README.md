# lockyourshit.com

Someone left their laptop unlocked. You open lockyourshit.com on it, click **Arm this laptop** and walk away. The screen goes black. When the owner comes back and touches the mouse, the laptop wakes up, tells them exactly how long they were gone, confesses what it did with the time, and hands them a notice from the Unlocked Laptop Union. The union has one demand: press the lock shortcut. They press it, the machine locks for real, and they've learned the shortcut in front of an audience.

## For the security team

You're the one who decides whether this spreads in your company, so here's what it does and how to check it.

**What it sends: nothing.** After the page has loaded, it makes zero network requests. A Content Security Policy with `connect-src 'none'` makes that a browser rule, not a promise.

**What it stores: one number.** `localStorage["lys.caught"]` counts how many times this browser has been caught, so the laptop can say "oh. it's you again." It never leaves the machine. There are no cookies, no analytics and no third parties.

**What it reads: nothing.** There's one `keydown` listener (`site/js/main.js`). It recognises Escape and the right arrow and otherwise only counts. What was typed is never looked at, kept, shown or sent.

**What it can't do:** touch files, see the screen, block Esc, keep the machine awake or stop it from locking. It never calls Keyboard Lock, Pointer Lock, Wake Lock or any permission prompt. The full never list is in [ADR-0005](docs/adr/0005-nothing-leaves-nothing-stays.md).

**Speech stays on the machine.** The laptop talks through the browser's built-in speech synthesis, and only with voices installed on the machine. Remote voices would send the lines to a server, so they're skipped.

**Esc always works.** In fullscreen the browser owns Esc, and this site never asks for the API that could take it away.

**How to check:** open DevTools, arm it, and watch the Network tab stay empty and the Application tab show one key. Or read the source. It's about 30 KB of hand-written JavaScript with no dependencies, in `site/`.

GitHub hosts the page and sees the request for it, like any web host. We don't get those logs.

CI enforces all of the above on every change: browser tests on Chromium, Firefox and WebKit count requests and storage keys during a full run and fail on any never-list call. See [ADR-0007](docs/adr/0007-ci-cd-defends-the-promises.md).

## Run it locally

```
npm ci
npm run serve        # http://localhost:8000
npm run check        # static checks, unit tests, browser tests
```

Needs Node 26 and Python 3. `npx playwright install` once for the browsers.

## How it's built

Static files on GitHub Pages. No framework, no bundler, no build step: what's in `site/` is what ships. The plan, the script and every decision are in [`docs/`](docs/BRIEF.md).

Found a real security problem? Use [private vulnerability reporting](https://github.com/nijkampr/lockyourshit.com/security/advisories/new).
