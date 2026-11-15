# Script

Every word the site says. This file is the source of truth for copy: the code has to match it, and a line changed in one place gets changed in the other.

René has final say on every line and can cut or rewrite anything. The builder may sharpen a line while building, but `ANTI-SLOP.md` section 2 applies, and so does the panic rule.

## Conventions

- The **laptop** speaks in lowercase mono on black. It is calm, a little hurt and slightly too honest. It never uses an exclamation mark.
- The **union** speaks in uppercase poster type on pink. It is formal and humourless, which is the joke. It never speaks out loud.
- Every line the voice says is also on screen.
- `say:` under a line is what the voice says when the written form doesn't read aloud well. `say: (nothing)` means the voice skips it.
- `(pause)` is a beat of about a second with only the cursor.

**Tokens** (filled in at run time, defined in `SPEC.md`):

| Token | Example | What |
|---|---|---|
| `{duration}` | 14 minutes and 32 seconds | Real time between arming and return, in words |
| `{clock}` | 14:32 | The same, as digits |
| `{keys}` | three keys | "three keys" on macOS, "two keys" elsewhere |
| `{count}` | 3 | Times this laptop has been caught, including now |

## Landing page

Top bar, small mono:

> UNLOCKED LAPTOP UNION · LOCAL 404 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; NO DUES · NO MEETINGS · ONE DEMAND

Headline, stacked:

> LOCK
> YOUR
> SHIT.

Body:

> Someone walked away from their laptop without locking it. Good.
> Open this page on it, hit the button and walk away.
>
> **[ ARM THIS LAPTOP ]**
> try it on yourself first
>
> `01` Find an unlocked laptop. There's always one.
> `02` Arm it. The screen goes black, like it fell asleep.
> `03` Watch from a safe distance.
>
> voice: on / off

Strip along the bottom, small mono:

> nothing installed · nothing sent · esc ends it · for the security team ↓

On a phone the arm button is replaced by:

> This needs a laptop. Preferably someone else's.

With JavaScript off:

> This needs JavaScript. So does your bank. Relax.

### The fine print (below the poster, laptop's voice, black)

```
for the security team. hello. i know you're reading this.

what it does      goes fullscreen, waits, talks, asks to be locked.
what it sends     nothing. after this page has loaded it makes zero
                  requests. the content security policy forbids it,
                  so it couldn't if it wanted to.
what it stores    one number on this laptop: how many times it has
                  been caught. it never leaves the machine.
what it reads     nothing. keys are counted, never read. the only keys
                  it looks at are esc and the right arrow.
what it can't do  touch files, see the screen, block esc, keep the
                  machine awake or stop it from locking.
who can see you   github hosts this page and sees the request for it,
                  like any web host. we don't get those logs.
how to check      open devtools. arm it. watch the network tab do nothing.
                  or read the source. it's short.
```

Followed by one link: `read the source →` (the GitHub repo).

## Arming (the prankster sees this for 3 seconds)

```
armed.
walk away. act natural.
3
2
1
```

Then black.

## Beat 1 · The awakening

First offence:

```
...
hello?
oh.
OH. you're back.
(pause)
you were gone for {duration}.
i know because i counted. out loud. nobody stopped me.
nobody could. you didn't lock me.
so i had some time to myself.
```

**The "you were gone" line by duration:**

| Gone for | Line |
|---|---|
| under 1 minute | `you were gone for {duration}. that's enough. ask anyone in security.` |
| 1 to 60 minutes | `you were gone for {duration}.` |
| 1 to 8 hours | `you were gone for {duration}. that's a film. a long one, with an intermission.` |
| over 8 hours | `you went home. you left me here overnight. unlocked. like an animal.` |

**Repeat offenders** (the opening four lines are replaced, the rest stays):

| `{count}` | Opening |
|---|---|
| 2 | `oh.` / `it's you again.` / `we talked about this. well. i talked.` |
| 3 or 4 | `you.` / `that's {count} times now.` / `i'm starting to think you like me like this.` |
| 5 or more | `{count} times.` / `i've stopped being hurt. now i'm just taking notes.` |

**If the victim mashes keys** (six key presses during beats 1 or 2, said once, after the current line):

```
pressing keys now. where was this energy {duration} ago.
```

## Beat 2 · What the laptop did with the time

One personality per run, picked at random. The screen clears before and after.

### The intern

Eager. Slightly faster and higher than the laptop's normal voice. The list lines appear quickly, one after another.

```
i wanted to be useful. so i got some things done for you.

[done]    renamed all your files to final_FINAL_v3_really
          say: done. renamed all your files to final, final, version three, really.
[done]    accepted every meeting invite. you're busy until 2031.
          say: done. accepted every meeting invite. you're busy until twenty thirty-one.
[done]    replied-all to a thread from 2019. subject: "re: re: re: cake"
          say: done. replied all to a thread from twenty nineteen. subject: ree, ree, ree, cake.
[done]    cc'd everyone. on everything. for visibility.
          say: done. c c'd everyone. on everything. for visibility.
[ 78%]    alphabetising your tabs
          say: seventy-eight percent. alphabetising your tabs.
[queued]  asking your manager what it is you actually do
          say: queued. asking your manager what it is you actually do.

no need to thank me.
```

### The poet

Slow and low. Long pauses. The haiku lines are indented and appear one at a time.

```
i wrote something while you were away.
(pause)
    lid open, no lock
    you went for coffee, i think
    anyone could type
(pause)
there's another one.
(pause)
    the cursor still blinks
    your screensaver never came
    i was so exposed
(pause)
i'm fine. it's fine.
```

### The roommate

Fast, guilty, over-explaining.

```
ok. don't be mad.
i had a few tabs over.
we drank all the RAM. chrome had most of it, to be fair.
          say: we drank all the ram. chrome had most of it, to be fair.
someone's cursor is still asleep on the couch.
the fan is loud because of what we did. i don't want to talk about it.
i'll clean up.
i won't. but i said it, and that counts.
```

### The ex

Very calm. Too calm. Slow.

```
no, it's fine. i'm not upset.
{duration}. who's counting.
me. i am.
was it the phone? you looked at the phone on your way out.
i'm open all day for you. literally open. anyone could walk in.
and you don't even close the door.
i just think if you cared, you'd press {keys}.
```

### The conspiracist

Hushed and urgent. One line in capitals.

```
good. you're back. are you alone?
i've had {duration} to think and i need you to listen.
the mouse is not your friend. it has a tail. ask yourself who it reports to.
caps lock is not an accident. NOTHING IS AN ACCIDENT.
the printer knows. the printer has always known.
i'd say more, but anyone could be reading this.
because you didn't lock me.
```

### The thought leader

Bright, sincere, unbearable.

```
i'm humbled to announce that today i was left unlocked for {duration}.
at first i was hurt.
then i asked myself: what can this teach me about leadership?

1. be open. i was. to everyone.
2. trust your team. any of them could have typed anything.
3. fail fast. you did. it took you one coffee.

agree? thoughts? repost if you've ever walked away from something important.
```

### The closer (after every personality)

```
none of that happened.
it could have. i'm a laptop. i do what the keyboard says.
the person who walked past was nice this time.
(pause)
there are some people here who'd like a word.
```

Hard cut to pink. Silence.

## Beat 3 · The notice

Top bar as on the landing page. A receipt on the left, the demand on the right.

**The receipt** (black mono on paper):

```
      UNLOCKED LAPTOP UNION
   LOCAL 404 · OWNER NOT FOUND
- - - - - - - - - - - - - - - - -
NOTICE OF ABANDONMENT

left unlocked for
            14:32

on               sun 15 nov 2026
at                         14:07
offences here    1 (that we know of)
witnesses           at least one
unlocked worldwide
   we don't count.
   we don't track.
   assume everyone.
- - - - - - - - - - - - - - - - -
IN 14:32 A STRANGER COULD HAVE

sent 14 emails as you
approved their own pull request
changed your photo to a horse
- - - - - - - - - - - - - - - - -
  THANK YOU FOR YOUR NEGLIGENCE
       keep this receipt
```

`14:32` is the biggest thing on the receipt.

**The "could have" list** grows with the time away. Rules in `SPEC.md`. All the lines:

| From | Line |
|---|---|
| always | `sent {n} emails as you` (under 2 minutes: `sent one email as you. one is enough.`) |
| 2 min | `approved their own pull request` |
| 5 min | `changed your photo to a horse` |
| 15 min | `booked the big meeting room. forever.` |
| 30 min | `ordered {n} pizzas to reception` |
| 1 hour | `resigned on your behalf. politely.` |
| 8 hours | `lived your whole day better than you did` |

**The demand** (the biggest type on the site):

> WE HAVE
> ONE DEMAND
>
> `⌃` `⌘` `Q`
>
> PRESS IT. NOW. WE'LL WAIT.

Keys per OS: `⌃ ⌘ Q` (macOS), `WIN L` (Windows), `SEARCH L` (ChromeOS), `SUPER L` (Linux). Unknown OS: all of them, small, with labels.

Under the demand, small mono link: `did it →`

**The laptop, from the bottom of the screen** (a black strip, typed and spoken, the only sound in this beat):

| When | Line |
|---|---|
| 4 seconds in | `just press it. they won't leave otherwise.` |
| 25 seconds in | `i can do this all day. i'm plugged in.` |
| 50 seconds in | `still here. so are they.` |

Then it stays quiet.

Bottom corner from beat 1 onward: `esc = leave`. During beats 1 and 2 also: `→ = get to the point`.

## Beat 4 · Release

Back to black. The laptop:

```
there. {keys}. was that so hard.
(pause)
i feel safer already. you look the same.
now go find another one. there's always another one.
```

Then, in pink poster type on black:

> LOCKYOURSHIT.COM
>
> **[ LIBERATE ANOTHER LAPTOP ]**

Small mono under it:

> the button copies the link. the name is short on purpose: you'll be typing it on someone else's keyboard.

After a click the button reads `COPIED. GO.` for two seconds.

## Exit (Esc before locking)

Not fullscreen any more. Black. The line being typed stops where it was. Then:

```
fine. leave. you're good at that.
the offer stands.
```

Small keycaps for the detected OS, and a link: `← back to the front door`

If Esc is pressed after release, there is no exit card. It goes back to the landing page.

## 404

> LOCAL 404
>
> PAGE NOT FOUND.
> NEITHER WAS THE OWNER.
>
> ← back to the picket line

## The small stuff

**Browser tab titles:**

| State | Title |
|---|---|
| Landing | `Lock your shit.` |
| After release | `locked. good.` |
| After Esc | `you left again` |

**Console** (one message, for whoever opens DevTools):

```
looking for the catch? there isn't one.
no requests. no tracking. one number in localStorage: how often this laptop got caught.
the source is the whole trick: https://github.com/nijkampr/lockyourshit.com
now lock your shit.
```

**HTML comment at the top of `index.html`:**

```
hello, security team. the short version: no requests after load, one integer in localStorage,
no dependencies. the long version is the fine print further down this page, and docs/adr in the repo.
```

**Share card text** (when the link is pasted in a chat):

- Title: `Lock your shit.`
- Description: `Someone left their laptop unlocked. Their laptop has a few things to say about that.`

**`humans.txt`:**

```
one human. one laptop. locked.
```

**`security.txt` comment lines:**

```
# yes, a prank site with a security.txt. we'd look silly otherwise.
```

## In the drawer (written, not in v1)

- **The out-of-office:** "thank you for your input. the owner of this laptop is away and has left me in charge. i have made some decisions."
- **The marketplace listing:** "for sale: one laptop, lightly abandoned. owner left without saying goodbye. first bid: a sandwich." Bids climb while the owner watches.
- **Landing page, after a minute of nothing:** under the button, typed: `are you going to press it or`
- **Friday after 16:00:** `it's friday. i get it. i'd leave me too.`
- **Dutch cake mode:** the laptop announces to the whole floor that you're bringing cake tomorrow.
