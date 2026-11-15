# ADR-0007: CI/CD exists to defend the promises

**Status:** Proposed · 2026-11-16

## Context

The site makes promises that are easy to break by accident: nothing leaves, one number stays, Esc works, no slop. A static site with no build doesn't need a pipeline to produce it. It needs one to stop a careless change from shipping a broken promise to laptops inside banks.

Deploying the repo root with "Pages from branch" would also publish `docs/`, `tests/` and `package.json` under the domain. Only `site/` should ship.

## Decision

**One workflow, `.github/workflows/ship.yml`. Every gate maps to a promise. Deploy only happens after every gate is green.**

### Jobs

| Job | Runs | Defends |
|---|---|---|
| `static` | `check-copy`, `check-source`, `check-budgets`, `html-validate` on `site/*.html` | No dashes or banned words. No external URLs, never-list APIs, forbidden CSS, `console.log`. The exact CSP string. `localStorage` in one file only. `security.txt` not about to expire. Size budgets. |
| `unit` | `node --test tests/unit` | The numbers are right. Every personality passes the panic-rule deny-list. |
| `e2e` | Playwright on Chromium, Firefox and WebKit (matrix) | The prank runs. Esc works from every state. Zero requests after load. One storage key. No never-list API called. No accessibility violations. Uploads the screenshots. |
| `deploy` | Only on push to `main`, `needs: [static, unit, e2e]`. Uploads `site/` as the Pages artifact and deploys it. | Only checked code ships, and only `site/` ships. |
| `smoke` | After `deploy`: fetch the live URL, expect 200 and the CSP meta tag in the body. | The deploy worked. |

Pull requests and pushes to other branches run everything except `deploy` and `smoke`.

### Rules for the workflow itself

- `permissions:` is `contents: read` at the top. Only `deploy` gets `pages: write` and `id-token: write`, and runs in the `github-pages` environment.
- Third-party and GitHub actions are pinned to a full commit SHA with the version in a comment. The builder looks up the current releases at build time. Nothing in this ADR hard-codes a version.
- `concurrency` on the deploy job so two pushes can't race.
- `.github/dependabot.yml` updates the pinned actions and the dev dependencies weekly.
- The check scripts are plain Node with no dependencies. They run the same locally: `npm run check`.

### Dev tooling

`package.json` exists for the checks only: Playwright, `@axe-core/playwright`, `html-validate`. With a lockfile. Nothing in `site/` imports from `node_modules`, and CI fails if it tries (the external-URL and bare-import check in `check-source`).

This is not a build step. No tool writes or rewrites a file in `site/` during CI. The two generators (`make-images.mjs` for the share card, and the font subsetting done once by hand) run on a developer machine and their output is committed.

### Repo settings

René allowed the builder to change repo settings through the `gh` CLI (16 Nov 2026). The builder sets:

1. Pages source: **GitHub Actions**.
2. Branch protection on `main`: require the `static`, `unit` and `e2e` checks. Work lands through pull requests, merged when green.
3. The custom domain and "Enforce HTTPS", once DNS resolves.

The DNS records at the registrar are the one thing René does by hand.

## Alternatives rejected

- **Pages from branch, repo root.** Publishes the docs and tests, and deploys even when checks fail.
- **A `gh-pages` branch.** A second copy of the site to keep in sync, for nothing.
- **Visual regression with pixel diffs.** Font rendering differs per runner and the failures would be noise. Screenshots are saved for a person to look at.
- **Lighthouse as a gate.** The page is 250 KB of static files. The budget check covers what matters.

## Consequences

- A change that adds a `fetch`, a second storage key, a gradient or an em-dash can't reach production.
- Merging a green pull request into `main` is a deploy. That is the intended way to ship.
- CI takes a couple of minutes because of three browser engines. Free on a public repo.
- Until the domain exists, the site deploys to `nijkampr.github.io/lockyourshit.com/` and the smoke test targets that URL. Relative URLs in `site/` make that work (the 404 page is the exception and looks plain there).
