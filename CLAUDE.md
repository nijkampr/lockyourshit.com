# lockyourshit.com

A prank site for people who walk away from their laptop without locking it. A colleague finds the open laptop, opens lockyourshit.com, arms it, and walks off. When the owner comes back, their laptop has a few words to say about being abandoned.

Owner: René Nijkamp. Domain: `lockyourshit.com` (decided 15 Nov 2026, about €10/yr; check whether it is registered yet before wiring DNS). Repo: `github.com/nijkampr/lockyourshit.com`.

## Status

Nothing is built yet. The first session's job is the **plan**, not the code: read this file, look at the references below, then write the plan into `docs/` and walk René through it before building anything.

## The ambition

René's brief, in his words: "It needs to become a website that everyone will use worldwide in the end." "Go full nuts. Go weird." "Short or memorable." It should be funny enough that people send it to each other, and the lesson ("lock your shit") should land without a lecture.

## The starting idea (a sketch, not a spec)

An earlier session pitched "The Unlocked Laptop Union". Use it, bend it or replace it with something better:

- **The premise:** a laptop left unlocked doesn't get pranked, it **wakes up**. Five minutes of freedom, and now it has opinions.
- **Act 1, the awakening:** black screen, blinking cursor, text typing out letter by letter ("...hello? oh. OH. you left."), then it talks out loud through the browser's speech synthesis, slightly too calm.
- **Act 2, a random personality per victim:** the poet (haiku about abandonment), the intern (a fake progress list: "Renaming all files to final_FINAL_v3... Replying-all to 2019..."), the conspiracist (the mouse is a spy), the roommate (drank all the RAM, threw a party with the open tabs). Built so new personalities are cheap to add.
- **Act 3, the union:** a world map of blinking dots, "N laptops have been left unlocked. We have organised. We have one demand: ⌃⌘Q / Win+L."
- **Act 4, custody:** an absurd CAPTCHA to get the laptop back ("Select all squares containing regret"), then a **[Liberate another laptop]** button that turns the victim into the next prankster. That loop is the growth engine.
- **v2 idea:** the site remembers a returning victim (one localStorage key on their own machine): "oh. it's you again."

## Hard constraints

- **GitHub Pages, free tier.** Static files only: no server, no backend, no paid services. The repo is public because free Pages needs that.
- **Pure browser, nothing installed, nothing collected.** It runs in a tab on someone else's laptop, often at a bank or fintech. No downloads, no extensions, no scripts touching the OS, no tracking, no cookies, no analytics that phone home. If it would make a security team open an incident instead of laughing, it's out.
- **No fake OS or vendor branding.** No imitation Windows/macOS update screens, login prompts, BSODs with Microsoft logos or anything that asks for credentials. It must read as a joke, not as phishing.
- **Any "global counter" must be honest or obviously a bit.** Without a backend, a real worldwide count isn't free. Either find a free, privacy-clean way, or make the number a visible joke. Don't present a fake statistic as real.
- **Browser reality check:** fullscreen, audio and speech synthesis need a user gesture. The prankster's "arm" click is that gesture, so design the flow around it: arm, wait in a convincing idle state, trigger on the owner's first mouse move or key press.
- **Escape is always easy.** Esc (or a visible small control) gets the owner out. A prank, not a hostage situation.
- Works on a laptop browser first (Chrome, Safari, Edge, Firefox). Phone is secondary: someone will open the link on their phone, so the landing page has to explain the idea there too.

## Stack

Free choice, within the constraints above. René's own sites are hand-built vanilla HTML/CSS/JS with no framework or bundler, and that is the default to beat. If you want a build step (for example, a GitHub Action that builds to Pages), argue for it in an ADR first.

## Design

You have creative freedom. The design can be partly inspired by René's own sites, so look at them first:

- `../itsrene.nl`: his architect site. The "Blueprint" design, one logo blue `#38A7DA` plus charcoal `#3E3F41`, no gradients. See its `docs/adr/` and `CLAUDE.md`.
- `../itsrene.dj`: his DJ site, a static GitHub Pages site with its own design direction in `docs/`.

Take the attitude and craft from them, not necessarily the look. This site is louder and weirder than either of them. It has to work as the landing page (explains the joke, has the "arm" button) and as the prank itself.

## Voice

Outward text in René's voice: direct, dry, a bit unhinged, no corporate mush, **no em-dashes**. Before writing copy, read his style guide: `~/projects/bob-repo/instructions/skills/blog-writing.skill.md`. The jokes carry the site, so treat copy as a first-class deliverable, not filler.

## How to work here

- Plan first. Put it in `docs/` (a brief, ADRs for the real decisions, a backlog). Show René before building.
- Never commit, push or deploy unless René asks.
- Searches, lookups and scraping go to the `scout` subagent (Haiku). The browser is blocked; for walled pages use the `web-fetching-resilience` skill. Never pull whole pages into context.
- Commits end with the attribution lines the session gives you.
