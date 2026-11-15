# ADR-0001: One document, vanilla, no build

**Status:** Proposed · 2026-11-15, updated 2026-11-16

## Context

The site is a landing page and a prank. It has to run from GitHub Pages for free, be readable by a suspicious security engineer in ten minutes, and keep the browser permissions it got from the prankster's click.

That last point decides the architecture. Fullscreen and speech are unlocked by a user gesture **in a document**. Navigate to another page and they're gone. So the landing page and the prank can't be two pages.

## Decision

**One HTML document, hand-written CSS and JS, no framework, no bundler, no runtime dependencies, no build step.**

- Everything that ships lives in `site/`, and ships byte for byte as it is in the repo.
- `site/index.html` holds the landing page and the hidden prank stage.
- A `data-state` attribute on `<html>` decides which screen shows. `js/main.js` owns it. States and transitions are in `SPEC.md` section 2.
- JS is native ES modules, split by concern into a handful of files (`SPEC.md` section 1). No file exists for fewer than one clear job.
- A personality is one module exporting a plain object. Adding one is a new file and one line in `personalities/index.js`.
- Everything is loaded with the landing page. Once armed, the page needs nothing from the network.

CI checks and deploys (ADR-0007). It never generates or rewrites anything in `site/`.

## Alternatives rejected

- **A framework or bundler.** The site is about 40 KB of our own code. A build step would put a dependency tree under a site whose selling point is that you can read all of it.
- **Separate landing and prank pages.** Loses the user gesture on navigation.
- **Personalities as JSON fetched on demand.** A fetch during the prank is a request after arming, which breaks ADR-0005.
- **Serving the repo root.** Would publish docs and tests. See ADR-0007.

## Consequences

- The View Source test passes by construction.
- No minification. Fine at this size.
- Dev tooling (Playwright, linters) lives outside `site/` and is never shipped.
- If the site outgrows one document, that's a new ADR, and it has to solve the gesture problem first.
