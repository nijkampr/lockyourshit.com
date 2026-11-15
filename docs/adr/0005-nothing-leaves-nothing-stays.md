# ADR-0005: Nothing leaves, one number stays

**Status:** Proposed · 2026-11-15, updated 2026-11-16 (René allowed one small stored thing)

## Context

This page runs on other people's work laptops, often in banks. The audience that decides whether it spreads inside a company is the security team. They have to be able to verify our claims in DevTools, not take our word for it.

## Decision

### Nothing leaves

- After the initial page load, the site makes **zero network requests**. Everything is loaded up front (ADR-0001).
- A Content Security Policy in a `<meta>` tag enforces it:
  `default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'`
  With `connect-src 'none'` the page can't call out even if someone adds code that tries. GitHub Pages can't set response headers, so it's a meta tag. A meta CSP can't carry `frame-ancestors`, so framing is handled in JS: a framed copy won't arm.
- No third-party anything: no CDN, no fonts from elsewhere, no analytics, no embeds.
- No inline scripts or styles, so the policy needs no exceptions.
- **Speech stays on the machine.** Browsers offer remote voices that send the text to a server. The voice module only uses voices flagged `localService`. No local voice means no voice (ADR-0006).
- `<meta name="referrer" content="no-referrer">`, so the one outbound link (to the source on GitHub) doesn't say where it came from.

### One number stays

- `localStorage` key `lys.caught` holds one integer: how many times this browser has been caught. It makes "oh. it's you again." and the "offences here" line on the receipt possible.
- That is all. No cookies, no sessionStorage, no IndexedDB, no service worker, no cache API. Preview runs store nothing.
- The number never leaves the machine. There is nowhere for it to go.
- The fine print on the landing page says exactly this, in one sentence. "Nothing is stored" would be a nicer claim. "One number, here is what it is" is a true one, and it's checkable in the Application tab.

### Keys are counted, never read

The prank reacts to key presses (the trigger, Esc, the skip, the key-mash joke). To anyone auditing the source, a `keydown` listener on a prank site is the first thing to check. So: there is one listener, it looks at `event.key` only to recognise Escape and the right arrow, and otherwise it increments a counter. Nothing typed is stored, shown or sent.

### The never list

APIs this site doesn't call, in any version, without a new ADR:

Keyboard Lock · Pointer Lock · Wake Lock · Idle Detection · screen capture · camera or microphone · clipboard read · notifications · geolocation · `beforeunload` prompts · `window.open` · downloads · `fetch` · `XMLHttpRequest` · WebSocket · `sendBeacon` · EventSource · cookies · sessionStorage · IndexedDB · service workers.

Clipboard **write** is allowed for one thing: the "liberate another laptop" button, on a click.

### The honest footnote

GitHub hosts the site. Like any web host, GitHub's servers see the request for the page. We don't get those logs and can't. The fine print says so.

## Consequences

- The security-team test is checkable in two minutes: open DevTools, arm, watch Network stay empty and Application show one key.
- CI enforces all of it (ADR-0007): a grep for the never-list names, the exact CSP string, `localStorage` in one file, and browser tests that count requests and storage keys during a full run.
- No usage numbers, ever. Accepted.
- If René changes his mind about the stored number, removing it is one function and three lines of copy.
