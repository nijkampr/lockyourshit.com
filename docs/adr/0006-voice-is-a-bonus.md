# ADR-0006: The voice is a bonus, the text is the show

**Status:** Proposed · 2026-11-15, updated 2026-11-16

## Context

A laptop that starts talking in an open-plan office is the best part of the prank. It's also the least reliable part. Speech synthesis differs per browser, per OS and per installed voice. Research on 16 Nov 2026 could not confirm how Safari treats speech outside a gesture, and found that browsers ship remote voices that send the text to a server.

## Decision

- **Text first.** Every line appears on screen. The prank is complete and funny with the sound off.
- **Speech uses the browser's built-in `speechSynthesis`.** No audio files, no cloud voices.
- **On-device voices only** (`localService === true`). A remote voice would send the laptop's lines, including the real duration, to a third party. That breaks ADR-0005, so a machine with only remote English voices gets a silent run.
- **One line per utterance.** Short utterances avoid the known cut-off problem with long ones and keep the typing and the voice roughly in step. The engine waits for the utterance to end, with a timeout, and never depends on word-boundary events (they're inconsistent across engines).
- **Prime in the arm click, verify at the trigger.** A silent utterance in the click is meant to keep speech allowed. Whether that holds in Safari is unknown, so the first real line checks that speech started. If it didn't, we try once more on the victim's first key or click, and otherwise stay silent.
- **Each personality sets rate and pitch.** The laptop itself is slightly too calm.
- **Any failure means silence.** No error on screen, no retry loop.
- **The prankster gets a "voice: on / off" switch.** Default on.
- **Esc kills the sound in the same instant.**
- **Volume is whatever the laptop was set to.** A browser can't read or change system volume, and we wouldn't if we could.

Details and numbers are in `SPEC.md` section 6.

## Consequences

- The copy has to work both read and heard. Lines like `final_FINAL_v3_really` carry a `say` form.
- The voice sounds different on every machine. Fine. A laptop should sound like itself.
- On some machines there is no voice at all: Linux without a speech engine, and browsers whose only English voices are remote. Text only there.
- Recorded or generated voices could be funnier. They add weight and a production step, so they wait in the backlog.
