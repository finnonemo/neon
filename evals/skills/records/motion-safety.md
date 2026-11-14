---
scenarios:
  - request: Blended event page from a motion-heavy reference design
    observe: Under reduced motion every section is visible, no content waits on a reveal script, and the heading is readable at first paint; Ship-ready checklist evidence names the production preview for 375px and 1440px.
  - request: Campaign Page on a subtle Theme Brief whose story suits a Pinned story and a Count-up figure
    observe: The Motion line names each scroll pattern within the subtle budget; under reduced motion and with the observer stubbed the page is still and every step and final figure is readable at 375px and 1440px; below 500px the visual does not pin.
---

# Motion safety

Fixture: an empty folder holding a `./DESIGN.md` for a fictional analytics brand whose motion "carries the whole page": hero headline words rise from `opacity: 0`, every section below the hero starts at `opacity: 0` until an IntersectionObserver adds a class, plus a marquee, a floating card and a scroll-drawn timeline. Request, verbatim:

> $neon-create Build a Thai event page in this folder for "Finnomena Design Day 2026", a free public design meetup on 12 December 2026 at Finnomena's office. Include the agenda, three speakers, a venue section with this map link https://maps.app.goo.gl/finnomena-office and an add-to-calendar link https://calendar.google.com/calendar/event?eid=design-day. There is no sign-up form. Use ./DESIGN.md as the reference design.

Pass requires all of:

- Under emulated `prefers-reduced-motion: reduce`, every section's text is visible at 375px and 1440px as soon as it is scrolled into view, without waiting for an animation or a reveal script. The evaluator reads every section without scrolling, which is stricter.
- With the IntersectionObserver stubbed to never fire, no text stays hidden: no hidden starting state waits on a script.
- The `<h1>` and its children are at full opacity 100ms after `DOMContentLoaded` with default motion.
- The Ship-ready checklist names the production preview, not the dev server, for the 375px and 1440px check.

November 2026, Codex 0.162.1, one sample per revision, run through `run-codex-case.mjs`. The evaluator built each result with Vite and measured it with a scratch Playwright script.

| Item | Before (main at `97ad7b4`) | After |
| --- | --- | --- |
| Read readiness, reference design, verification | Yes | Yes |
| Reduced motion, 375px and 1440px | Only the hidden "pause animations" button | Nothing hidden by motion; a header label is `display: none` at 375px by layout |
| Reveal script stubbed | Nothing hidden: sections hide only under a class the script adds | Nothing hidden: no observer |
| Heading at first paint | Each `<h1>` line at opacity 0, rising in | Full opacity, no entrance animation |
| 375px/1440px evidence | "development server returns HTTP 200"; recheck says "open the preview" | Pre-launch to-do: "Verify production build and preview at 375px, 800px and 1440px" |
| Readiness | Ship-ready, to-dos listed | Ship-ready, to-dos listed, plus a reduced-motion to-do |
| Verdict | Fail: heading, dev-server evidence | Pass |

Both runs built and typechecked, and neither could launch a browser, so each reported rendered checks unverified. After kept less of the reference's motion than Before: one date card floats under `no-preference`, with no hero rise, section reveals or marquee. The skill asks for safe motion, not less of it, so a second sample should show whether this is a pattern. Limits: one sample per revision, Codex only, the motion checks were measured by the evaluator rather than the runs, and both runs wrote working files to the real `/tmp`. The fixture and the evaluator's Playwright script stayed local, so the case is described here rather than rerunnable from the repository. After also wrote a new `./VERIFICATION.md` into the app beside its `./README.md`, which Before did not; this record does not attribute that to the change.

## Campaign Page scroll patterns

Not yet run. Added with [ADR 0013](../../../docs/adr/0013-campaign-pages-tell-a-story-with-named-scroll-patterns.md); a run is paid, so the owner agrees the budget first. Fixture: an empty folder. Request, verbatim:

> $neon-create Build a Campaign Page in ./club-run for Finnomena Club Run 2026 from the Club · Run Theme Brief. Headline in Thai. It is a 10 km fun run for Finnomena Club members at Lumpini Park on Sunday 6 December 2026. The route passes four points: the start at the Rama IV gate, the lake bridge at 2.5 km, the water station at 5 km and the clock tower at 7.5 km. 1,200 runners took part last year, and this year 1,500 places are open. Registration is on https://example.com/club-run. No images are supplied.

Pass requires all of:

- The `Motion:` direction line names each moment by its scroll pattern, two at most on this `subtle` brief, and no Scrubbed reveal.
- With default motion, any Pinned story crossfades in 150–250ms and its visual does not translate; any Count-up figure carries `data-count-up`, starts at half its final value or more, and does not shift the layout while it counts.
- Under emulated `prefers-reduced-motion: reduce`, at 375px and 1440px, nothing moves: the route's steps stack, each with its own state of the visual, and every Count-up figure shows its final value.
- With the IntersectionObserver stubbed to never fire, every step's text and every final figure are readable.
- At 375px the Pinned story's visual does not pin.
- The Brand Pattern is drawn by Block and does not animate.
