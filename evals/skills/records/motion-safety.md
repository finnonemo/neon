---
scenarios:
  - request: Blended event page from a motion-heavy reference design
    observe: Under reduced motion every section is visible, no content waits on a reveal script, and the heading is readable at first paint; Ship-ready checklist evidence names the production preview for 375px and 1440px.
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
