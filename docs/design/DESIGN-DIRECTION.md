# Design Direction: "Strike Notice"

**The concept in one sentence:** two voices on two colours. The laptop whispers in mono on black, the union shouts in poster type on pink, and the cut between them is the punchline.

**Status:** proposal, updated 16 Nov 2026. Read `ANTI-SLOP.md` section 1 with this file. That one says what is never allowed. This one says what to make.

## Two voices, three surfaces

| Surface | Who speaks | Looks like |
|---|---|---|
| **The void** | The laptop | Pure black, lowercase mono, one pink block cursor. A display that woke up and started typing. |
| **The picket** | The union | Full-bleed pink, huge black uppercase type, black rules. A strike poster. |
| **The receipt** | The union's paperwork | Off-white paper, black mono, dashed rules. A till receipt lying on the pink, slightly crooked. |

The landing page is the picket. Armed, beats 1 and 2, the release and the exit card are the void. The notice is the receipt on the picket. That's the whole system. There is no fourth surface.

## What I take from itsrene.nl and itsrene.dj

- **One accent colour, defended like a border.** Both sites run on a single blue and refuse a second accent.
- **Big display type with a tiny mono annotation.** The signature pairing of itsrene.dj. Here it's `LOCK YOUR SHIT.` under `UNLOCKED LAPTOP UNION · LOCAL 404`.
- **Real numbers as the graphics.** itsrene.dj sets its stats huge because they're true. Here the hero graphic is `14:32`, and it's true as well.
- **Hairlines and square corners.** Structure comes from rules, not boxes.
- **The anti-slop contract** as a written, enforced thing.
- **Hand-built and budgeted.** Self-hosted fonts, a CSS size cap, a View Source an engineer nods at.
- **One signature element** (itsrene.nl ADR-0004). There, the scroll-drawn trace. Here, the cursor.

## What I deliberately don't take

- **The dosage.** On itsrene.dj the accent covers under 5% of the viewport. Here it covers 100% at the climax. Same discipline, opposite volume.
- **The blue.** Both blues stay on René's own sites. This is not a portfolio piece and shouldn't look like one.
- **The calm.** Those sites earn trust by restraint. This one earns a laugh with a hard cut from silence to shouting.
- **Photography, scrolling as structure, and Inter.** No photos. The prank never scrolls. Every word is either the laptop or the union, so two fonts cover it.

## Colour

```css
:root {
  --void:  #000000;  /* armed state and the laptop's screen. true black: it has to pass for a sleeping display */
  --ink:   #0B0B0C;  /* type and rules on pink and on paper */
  --paper: #F4F1EA;  /* the receipt. also the laptop's type on the void */
  --dim:   #8C8C8C;  /* hints in the corners of the void. nothing else */
  --loud:  #FF2D8A;  /* THE pink */
}
```

These five values are the only colours in the stylesheet. CI checks that.

**Allowed pairs** (all pass AA for their size):

| Text | On | Ratio |
|---|---|---|
| `--ink` | `--loud` | about 6:1 |
| `--ink` | `--paper` | about 17:1 |
| `--paper` | `--void` | about 18:1 |
| `--loud` | `--void` | about 6:1, large type and the cursor only |
| `--dim` | `--void` | about 6:1, the corner hints only |

White on pink fails (about 3.5:1) and is never used. Pink text on paper is never used.

**Why pink.** No operating system uses it for anything. A blue fullscreen reads as a crash, a red one as ransomware, a grey one as a login screen. A hot pink one reads as a joke from across the room, which is the legal and social position we want. It photographs well, and the photo is the growth engine.

## Typography

Two faces, self-hosted woff2, subset to what we use:

| Voice | Face | Settings |
|---|---|---|
| **The union** | Archivo variable | weight 900, width axis at its narrowest (`font-stretch: 62%`), uppercase, `line-height: 0.82`, `letter-spacing: -0.01em` |
| **The laptop** | JetBrains Mono variable | weight 400, and 700 for the duration on the receipt. `line-height: 1.5`. Lowercase when the laptop talks |

itsrene.dj uses Archivo wide. This site uses the same family at the other end of its width axis, heavy and packed. The family link is there for anyone who looks. The builder subsets fresh files from the upstream variable fonts (Latin, digits, punctuation, `·` `→` `←` `↓`) and confirms the width axis is in the file. If the narrow width isn't available, stop and ask René. Don't swap in a different face quietly.

**Small mono annotations** are 12 to 13px, uppercase, `letter-spacing: 0.08em`.

**No italics, no underlines except links, no third weight.**

## The cursor

The block cursor is the laptop's face and the only pink thing in the void. It's a CSS box, not a font glyph: `0.6em` wide, `1.15em` tall, `--loud`, sitting on the baseline at the end of the current line.

| Mood | Behaviour |
|---|---|
| idle | blinks, 530 ms on, 530 ms off, hard steps (no fading) |
| typing | solid |
| `think` | blinks for 800 ms before a line |
| `still` | solid and motionless for 1200 ms. It's hurt. |
| `stutter` | three fast blinks. Used before `OH.` |

The favicon is the cursor: a pink block on black. There is no other logo, mascot, icon or illustration anywhere.

## Screens

Sizes below are starting values. The builder tunes them by looking at screenshots, and the measure of success is the squint test in `ANTI-SLOP.md`, not these numbers.

### Landing (the picket)

Exactly one viewport tall on a laptop. Pink.

```
┌──────────────────────────────────────────────────────────────────────┐
│ UNLOCKED LAPTOP UNION · LOCAL 404        NO DUES · NO MEETINGS · ONE… │  mono 12px
├══════════════════════════════════════════╤═══════════════════════════┤  2px ink rule
│                                          │                           │
│  LOCK                                    │  Someone walked away…     │
│  YOUR                                    │                           │
│  SHIT.                                   │  ┌─────────────────────┐  │
│                                          │  │  ARM THIS LAPTOP    │  │
│  (three lines, filling the height)       │  └─────────────────────┘  │
│                                          │  try it on yourself first │
│                                          │  ─────────────────────── │  1px rules
│                                          │  01  Find an unlocked…    │
│                                          │  02  Arm it…              │
│                                          │  03  Watch from a safe…   │
│                                          │  ─────────────────────── │
│                                          │  voice: on / off          │
├══════════════════════════════════════════╧═══════════════════════════┤
│ nothing installed · nothing sent · esc ends it · for the security team ↓ │
└──────────────────────────────────────────────────────────────────────┘
```

- **Split:** about 60 / 40, divided by a 2px ink rule. The headline column is left-aligned and bleeds to the left edge padding. Nothing is centred.
- **Headline:** three stacked lines, `font-size: min(30vh, 21vw)`. It should nearly touch the rules above and below. The full stop stays.
- **Body copy** in the right column is mono, 16 to 18px, max 34 characters wide.
- **The arm button:** `--ink` fill, `--loud` text, Archivo 900, uppercase, square, full width of the column, about 4.5rem tall. Hover and focus swap the colours instantly (pink fill, ink text, 3px ink border). Pressed moves it down 2px. No transition.
- **"try it on yourself first"** is a mono text link, underlined, ink.
- **Steps:** `01 02 03` in mono 700, the text in mono 400, 1px ink rules between.
- **Voice switch:** the words `voice: on / off` in mono. The active word is ink on pink inverted (ink background, pink text). It's a real button with `aria-pressed`.
- **Bottom strip:** mono 12px. "for the security team ↓" scrolls to the fine print.
- **Under 900px wide:** one column. Headline at `font-size: 31vw`, then the copy. The page scrolls.

**The fine print** sits directly under the poster: the void. Black, mono, paper-coloured text in the two-column table shape from `SCRIPT.md`, max 72 characters wide, left-aligned with the headline. The labels (`what it sends`) are `--dim`. One link at the end.

### Arming

The void. Two lines in mono, then the countdown digit in Archivo at `40vh`, pink, bottom left. Each digit is a cut.

### Armed

`#000`. Nothing in it. `cursor: none`.

### The void (beats 1 and 2, release)

- Text area: from `8vw` left, `10vh` top, max 62 characters wide, bottom limit `14vh` from the bottom.
- Type: mono, `clamp(1.125rem, 2.1vw, 1.875rem)`, `--paper`. Left-aligned. Whitespace preserved (the intern's list and the haiku depend on it).
- Bottom left: `esc = leave`. Bottom right: `→ = get to the point`. Mono 12px, `--dim`. They are there from the first character.
- Preview label: top right, mono 12px, `--dim`.

### The notice

Pink. The top bar from the landing page, then two columns.

```
┌──────────────────────────────────────────────────────────────────────┐
│ UNLOCKED LAPTOP UNION · LOCAL 404        NO DUES · NO MEETINGS · ONE… │
├══════════════════════════════════════════════════════════════════════┤
│   ┌───────────────────┐                                              │
│   │ ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ │        WE HAVE                               │
│   │ UNLOCKED LAPTOP…  │        ONE DEMAND                            │
│   │                   │                                              │
│   │ left unlocked for │        ┌─────┐ ┌─────┐ ┌─────┐               │
│   │      14:32        │        │  ⌃  │ │  ⌘  │ │  Q  │               │
│   │                   │        │ctrl │ │ cmd │ │     │               │
│   │ …                 │        └─────┘ └─────┘ └─────┘               │
│   │ ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ │        PRESS IT. NOW. WE'LL WAIT.            │
│   └───────────────────┘        did it →                              │
├──────────────────────────────────────────────────────────────────────┤
│ ▮ just press it. they won't leave otherwise.            esc = leave  │  black strip
└──────────────────────────────────────────────────────────────────────┘
```

- **The receipt:** `--paper`, 34 characters wide in mono 14 to 16px, rotated `-2deg`, with a zigzag torn edge top and bottom made with `clip-path`. No shadow. No border. The duration is mono 700 at `clamp(3rem, 6vw, 5.5rem)`. Rules are rows of spaced hyphens in the text, as in the script.
- **The demand:** Archivo, `font-size: min(13vh, 8vw)`, two lines.
- **Keycaps:** squares of `clamp(5rem, 11vw, 9.5rem)`, 4px ink border with a 10px bottom border (that's the only depth cue on the site), 2px radius, pink inside. The glyph is Archivo 900 at about 45% of the key. The Mac glyphs `⌃` and `⌘` aren't in Archivo but are in JetBrains Mono, so those two are set in the mono at 700. Under each glyph, the key's name in mono 11px (`control`, `command`). No vendor logos: the Windows key says `WIN`.
- **The demo:** the keys press down one after another, then all release, every 3 seconds. Pressed means moved down 6px with the bottom border reduced to 4px. Stepped, no easing. With reduced motion the keys stay still.
- **"PRESS IT. NOW. WE'LL WAIT."** Archivo, about a third of the demand's size.
- **The strip:** full width, `--void`, 3.5rem tall. The laptop's nags type here in mono with the pink cursor. The esc hint moves into its right end.
- **Under 900px wide:** the demand first, the receipt under it, unrotated.

**The print stylesheet** hides everything but the receipt and prints it black on white, unrotated, at receipt width. Someone will tape it to a monitor.

### Release

The void. The laptop's lines as in beat 1. Then `LOCKYOURSHIT.COM` in Archivo, `--loud`, `font-size: min(16vh, 9vw)`, and under it the liberate button: `--loud` fill, `--ink` text, same shape as the arm button. The mono note under that.

### Exit card

The void, not fullscreen. The interrupted line stays where it stopped, the cursor after it. Then the two exit lines, a small row of keycaps (4rem, paper-coloured borders on black) and the link back.

### 404

The picket. Top bar, then `LOCAL 404` at headline size, the two lines under it at a third of that, and the link in mono.

### Share card and icons

1200×630, pink, the stacked headline filling the left two thirds, the top-bar annotation above a 2px rule, and `LOCKYOURSHIT.COM` in mono bottom right. The favicon is the pink block on black. Nothing else.

## Motion and sound

- **Typing** and **the cursor** are the only animation in the void.
- **The keycap demo** is the only animation on the picket.
- **Every state change is a cut.** No fade, no slide, no easing, anywhere. One cut from black to pink is funnier than any transition, and it's safe for photosensitive viewers. Nothing flashes or strobes.
- **`prefers-reduced-motion`:** lines appear whole, the cursor is solid, the keys are still.
- **Sound** is the browser's speech voice and nothing else. No chimes, no beeps, no alarms.

## Details that separate made from generated

- `::selection` is ink on pink (and pink on black in the void).
- Focus rings are 3px solid, offset 3px: ink on pink, paper on black. Never the browser default.
- Links are ink (or paper in the void) with a 2px underline. No colour change on hover: the underline goes to 4px.
- The scrollbar on the landing page is left alone. No custom scrollbars.
- Text never touches the screen edge: minimum padding is `max(1.25rem, 3vw)`.
- Numbers in the receipt use tabular figures, so `14:32` doesn't jitter between runs.

## Budgets

| Thing | Cap |
|---|---|
| `style.css` | 14 KB |
| All JS in `site/js` | 36 KB |
| Fonts | 2 files, 90 KB together |
| Images | favicon SVG, two small PNG icons, one share card under 60 KB |
| Everything the landing page loads | 250 KB |

CI enforces these on the raw files.
