# Campaign Pages tell a story with named scroll patterns

> Status: Proposed, 2026-11-14. Waits for the owner's picks on the three choices below; nothing in the skills changes until they are made.

The owner found that Campaign Pages lack imagination: there is no scrollytelling, and the motion clings to restraint. The restraint is Neon's own rule. `skills/neon-create/references/campaign-direction.md` §Motion allows at most two moments of motion per page and keeps movement tied to scroll under a tenth of the element's height, so a sticky section, a picture that changes with the story or a figure that counts up cannot be built within it. This ADR widens that budget for Campaign Pages only, by a small set of named scroll patterns the agent picks from rather than invents. It amends the Budget and Cost lines of that §Motion and the "motion on every section" habit; `skills/neon-audit/references/functional-patterns.md` §Motion, which holds for functional screens, is unchanged.

## What stays

These hold for every pattern, whatever the owner picks below:

- **Reduced motion is honoured.** Every pattern has a form under `prefers-reduced-motion: reduce`, and the motion itself sits under `prefers-reduced-motion: no-preference`. A person who asked their device for less motion gets it; movement tied to scroll is a common trigger for people with vestibular disorders.
- **`transform` and `opacity` only.** Scroll-linked motion runs on every frame the reader scrolls; any other property forces layout or paint each frame and stutters first on slower phones. The one exception is the Count-up figure's text, under the rules given for it.
- **The first screen reads as a still.** No pattern carries the hero's proposition, and no pattern animates a Brand Pattern.
- **Content never waits for a script.** A hidden starting state lives only under an attribute or class a script sets, so a late or failed script leaves the content visible (item 4 of the shared checklist in `skills/neon-redesign/references/verification.md`).
- **Never behind text.** No pattern moves anything under running text; text sits beside the moving element or on a still ground.
- **Each use is written in the Form line** that §Motion already requires: what moves, what it tells the reader, how it feels, its limit and its reduced-motion form. A use that tells the reader nothing is cut.

## The patterns

Four patterns, each with the level a Theme Brief must have for it. The names are proposals and become GLOSSARY terms once approved.

| Pattern | What moves | What it tells | Limit | Level |
|---|---|---|---|---|
| **Pinned story** | A visual stays pinned (`position: sticky`) while 3–5 text steps scroll beside it; at each step the visual crossfades to that step's state | Order: the steps of a journey, a product, a day | One per page; 3–5 steps; crossfade 150–250ms; the visual does not translate | `subtle` and `lively` |
| **Scrubbed reveal** | One image or block scales from 0.92 to 1 and fades in as its section crosses the viewport, tied to scroll progress; its keyframes apply only under an attribute a script sets | Cause or emphasis: the thing the section is about arrives | Translation 32px or less, scale 0.92–1; once per section, two per page | `lively` |
| **Count-up figure** | A display-role figure counts from a lower value to its final value once, as it enters view | Size: a distance, a sum, a number of members | 600–1200ms, ease-out, once; the figure's final value is in the HTML | `subtle` and `lively` |
| **Progress rail** | A thin bar beside or above a long section scales on `scaleX`/`scaleY` with scroll progress through it | Progress: how far along a route, a schedule or a list the reader is | One per page; it never carries a label the reader must read | `subtle` and `lively` |

Details the table leaves out:

- **What counts as a moment.** One use of a pattern is one moment: a Pinned story with five crossfades is one moment, and each Scrubbed reveal is one.
- **Timing within the level.** Every movement keeps its level's range in `scripts/theme-briefs/render.mjs` (`subtle` 150–250ms, `lively` 200–400ms). The Count-up figure's 600–1200ms is exempt, because it changes digits in place and moves nothing.
- **Pinned story on narrow screens.** Below the `md` tier the visual does not pin: each step shows its own state of the visual above its text, so a 375px screen never splits between a pinned image and scrolling text.
- **Count-up figure.** The figure uses `font-variant-numeric: tabular-nums` and a width fixed to its final value, so the count does not shift layout. Screen readers read the final value only (`aria-hidden` on the counting text, the final value in visually hidden text or `aria-label`). It counts from a value at least half of the final, never from zero, so the first frame still reads as a fact of the right size.
- **How they run.** CSS scroll-driven animation (`animation-timeline: view()` or `scroll()`) where `@supports` finds it, otherwise an `IntersectionObserver`, or a passive scroll listener throttled to animation frames. The Pinned story's step changes come from an `IntersectionObserver` on the steps.

## The choices for the owner

### 1. Budget

Hover, focus and press changes are never counted.

- **A (recommended).** Up to **three** moments on a `lively` page and **two** on a `subtle` page, at most one of them a Pinned story. The `subtle` page keeps today's count but may spend it on the patterns allowed at `subtle`.
- **B.** Up to **four** on `lively` and **three** on `subtle`.

Every Theme Brief today is `subtle`. Under either option, a Scrubbed reveal reaches a page only when its brief moves to `lively`.

### 2. Which level the Pinned story needs

- **A (recommended).** `subtle` and `lively`, as in the table. Its only motion is a crossfade of a still visual, so it suits `subtle`, and the four existing briefs can use it at once.
- **B.** `lively` only. A brief has to move to `lively` before any page can use it.

### 3. What reduced motion leaves

- **A: still (recommended).** Under `reduce`, no pattern moves:
  - A Pinned story stacks its steps, each step with its own state of the visual, the same layout as on narrow screens.
  - A Scrubbed reveal shows its end state.
  - A Count-up figure shows its final value.
  - A Progress rail is hidden.

  This is the rule every brief already states ("use the still level"), so nothing else changes.
- **B: fade only.** Under `reduce`, crossfades and fades of 200ms or less stay, and there is no translation, scale or counting. A Pinned story may still pin, since pinning is not motion, and still crossfade between steps. Choosing B means changing the reduced-motion sentence in `scripts/theme-briefs/render.mjs`, which writes row 11 of the brief's sections (`docs/design/theme-briefs.md`), and redrawing the four briefs.

## Considered Options

- **Lift the budget and let the agent compose freely:** rejected, by the owner's decision. A free hand gives a different and untested motion on every page, and no review can say whether a page followed the rule.
- **Allow any CSS property for scroll motion:** rejected; see What stays.
- **Scrollytelling on functional screens too:** out of scope. Functional screens keep the rule that motion explains a change and does not decorate.
- **Parallax behind text:** rejected. It breaks "never behind text", and layers moving at different speeds are a known vestibular trigger.

## Consequences

Once the owner picks:

- `skills/neon-create/references/campaign-direction.md` §Motion:
  - Budget and Cost take the picked numbers and the four patterns.
  - The habit "motion on every section" stays.
  - A new habit, "a pattern used where it tells nothing", joins it.
  - The Look-at-it question on motion names the pattern.
- `scripts/theme-briefs/render.mjs`:
  - The `subtle` and `lively` vocabulary names the patterns its level allows.
  - The four briefs are redrawn. With option 3B, the reduced-motion sentence changes too.
- `scripts/probe-page.mjs`'s `motionLevel` reads a transition over 250ms as `lively`. It learns the Count-up figure's exemption, so a `subtle` page with one is not misread.
- `evals/skills/records/motion-safety.md` gains a Campaign Page case that uses a Pinned story and a Count-up figure. It is checked at 375px and 1440px, with and without reduced motion.
- The review set of 6–8 briefs (half functional, half immersive) runs before and after the skill change, and the owner's ✓/✗ is the evidence.
- The pattern names enter `GLOSSARY.md` once approved.
