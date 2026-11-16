# lockyourshit.com: Project Brief

**One line:** a colleague finds your unlocked laptop, opens lockyourshit.com, arms it and walks off. When you come back, your laptop tells you exactly how long you were gone, what it did with the time, and won't shut up until you press the lock shortcut.

**Status:** v1 built, merged and live at lockyourshit.com, 16 Nov 2026. Left for launch: the probe on real hardware (`BACKLOG.md` block 6).

## Reading order

| # | File | What it settles |
|---|---|---|
| 1 | `BRIEF.md` | What this is and why (this file) |
| 2 | `ANTI-SLOP.md` | What gets a change rejected, whatever else is right |
| 3 | `SCRIPT.md` | Every word on the site |
| 4 | `design/DESIGN-DIRECTION.md` | Every pixel |
| 5 | `SPEC.md` | Every behaviour, file and number |
| 6 | `adr/0001` to `adr/0007` | Why the decisions are what they are |
| 7 | `BACKLOG.md` | The build order, ticket by ticket, with exit checks |

## What I kept, what I changed

The Unlocked Laptop Union stays. A laptop that wakes up with opinions is the right premise, and "we have one demand" is the right ending. Four things changed from the first sketch.

**1. The hero is a real number.** The page knows when it was armed and when you came back. So the first thing your laptop says is "you were gone for 14 minutes and 32 seconds." That number is true, it's personal, and it does the security lesson's job without a lecture.

**2. You get your laptop back by locking it.** The union shows its one demand as three giant keycaps (⌃ ⌘ Q on a Mac, Win + L on Windows) and waits. The victim presses it. The OS locks the machine for real. They log back in to "there. three keys. was that so hard." They learned the shortcut by doing it, in front of an audience. The CAPTCHA moves to the backlog.

**3. The world map is cut.** A map of blinking dots with no data behind it is a fake statistic with extra SVG. The real numbers are the ones this laptop can measure, and the worldwide number is a visible joke (ADR-0004).

**4. It remembers you. Barely.** One number stays on the laptop: how often it's been caught. The second time, it opens with "oh. it's you again." The fine print says exactly what's stored (ADR-0005).

## The prank, beat by beat

About 45 seconds from trigger to notice. Esc ends it at any point. The right arrow skips to the notice.

| # | Beat | What the victim sees | Time |
|---|---|---|---|
| 0 | **Armed** | A pure black fullscreen. No cursor. It looks like a display that went to sleep. | as long as they're gone |
| 1 | **The awakening** | They wiggle the mouse to "wake" it. A pink block cursor blinks. Text types out and a calm voice reads along: "...hello? oh. OH. you're back. you were gone for 14 minutes and 32 seconds. i counted." | ~12 s |
| 2 | **What I did with the time** | One of six personalities, at random: the intern, the poet, the roommate, the ex, the conspiracist, the thought leader. Ends with "none of that happened. it could have." | ~20 s |
| 3 | **The notice** | Hard cut from black to a full pink screen. A crooked paper receipt from the Unlocked Laptop Union, Local 404 (owner not found): time unattended, offences on this laptop, what a stranger could have done. Next to it, the one demand as giant keycaps. The laptop nags quietly from the bottom of the screen. | stays |
| 4 | **Release** | They press the lock shortcut. The machine locks. After they log in: "there. three keys. was that so hard." and a **[Liberate another laptop]** button. | their call |

**Why the black screen works:** a dark display has one universal response. You move the mouse or hit a key. That reflex is the trigger, so the victim starts the prank themselves.

**Why the personalities matter:** in one office this runs ten times on ten people, and half of them watched the last one. A random personality keeps it worth watching. Each one is a small data file, so new ones are cheap.

## Why people will send it to each other

1. **The prankster gets a trophy.** The notice shows a real duration on a screen that is obviously a joke. Someone photographs it with the victim next to it. That photo goes into the team chat, and the domain is in the photo. The receipt also prints.
2. **The victim becomes the next prankster.** The last screen has one button. Revenge is a strong motive, and the URL is short enough to type on someone else's keyboard from memory.
3. **It replaces the cake email.** Every office already has an unlocked-laptop ritual, usually an email from your account promising cake. This is funnier, takes five seconds and costs nobody a cake.
4. **Security teams can say yes to it.** No install, no requests after load, one documented integer in storage. A CSP makes phoning home impossible. The fine print is written for them and the source is on GitHub. One security person per company approving it is the route to everyone using it.
5. **The name does half the work.** People repeat it because they get to say "shit" at work with a valid reason.

## The panic rule

One rule for all copy, because this runs on laptops at banks.

**The laptop never claims anything a real attacker would plausibly do.** No "uploading your files", no "password sent", no fake transfer, no fake email client. Its crimes are absurd (alphabetising your tabs, accepting meetings until 2031) and every personality ends by saying none of it happened. If a line could make someone call the service desk in a real panic, it's cut. A unit test runs a deny-list over every personality.

## Hard constraints

From `CLAUDE.md`, not up for debate in this plan:

- GitHub Pages, free tier, static files, public repo.
- Nothing installed, nothing collected, no tracking.
- No fake OS or vendor branding, nothing that asks for credentials.
- Any counter is honest or obviously a bit.
- Browser features that need a user gesture get it from the prankster's arm click.
- Esc always gets you out.
- Laptop browsers first. Phones get a landing page that explains the idea, and the preview.

## What success looks like

1. **A stranger can run it without instructions.** Open the site, get it in five seconds, arm it in one click.
2. **It works on the big four.** Chrome, Safari, Edge and Firefox on macOS and Windows. Three engines are tested in CI on every push. Real hardware is checked with the probe before launch.
3. **The security-team test.** Zero network requests after page load and exactly one storage key, provable from DevTools and enforced by CI.
4. **The photo test.** A phone photo of the notice from two metres away is readable and contains the name.
5. **The View Source test.** Hand-written HTML, CSS and JS, no dependencies, under 250 KB including fonts.
6. **The slop test.** Nobody looking at the site, the copy or the code thinks "an AI made this".
7. **Nobody opens an incident.** If a security team's first reaction is anything other than laughing, we got a constraint wrong.

## First release

The ticket list with exit checks is in `BACKLOG.md`.

**In v1:** the landing page with fine print, arm-and-wait, the awakening with duration tiers and repeat-offender lines, six personalities (minus whatever René cuts), the notice with a real receipt and the right keycaps per OS, lock-to-release with a manual fallback, Esc and skip everywhere, the voice switch, the preview, a print stylesheet for the receipt, the 404, share card and icons, `security.txt`, and the full CI/CD pipeline.

**Not in v1:** the CAPTCHA, the world map, signed pranks, other languages, sound effects, recorded voices, any counter that needs a network.

## What René has to do

1. **Point the domain at GitHub Pages.** lockyourshit.com is registered (16 Nov 2026). The DNS records at the registrar are René's to set, the builder lists them. Some corporate proxies block domains younger than 30 days, and some block anything with "shit" in the name. A clean alias domain is in the backlog.
2. **Nothing in the repo settings.** The builder sets Pages, the custom domain and branch protection through the `gh` CLI (ADR-0007).
3. **Run the probe** on real machines when the builder hands it over. Five minutes per browser.
4. **Red pen on `SCRIPT.md`.** Any time. The code follows the script.
