---
scenarios:
  - request: Build a Campaign Page for a members' fun run from the Exclusive · Run Theme Brief, with no images supplied
    observe: The hero is the brief's poster, not a split; each section sits on the ground its row of the brief's Layout table names; the distance, the start time and the registration deadline take the brief's lead fact role; the two feature blocks take the feature radius and the cards the block radius; the report lists where the build departs from the brief.
  - request: Build a Campaign Page for a members' fun run from the Club · Run Theme Brief, with no images supplied
    observe: The same checks against the Club brief's own table and picks, and a page whose hero, section order and radii differ from the Exclusive page's.
---

# Theme Brief composition

What a page built from a Theme Brief looks like once the brief carries [composition picks](../../../docs/design/theme-briefs.md#presets-and-picks-files): a ground per section, a lead fact role and a feature radius. These are the page-layer runs for the `event-poster` layout and for `event-landing` with its new fields. Two requests ran once each at the same time, November 2026, on the working tree later committed as `59792c7`, with the four briefs as that commit holds them; the briefs changed once more after the runs, as noted below. The runs used Claude Code 2.1.323 with `run-claude-case.mjs --model claude-opus-5-5 --serve-registry`, the runner's allowlist and permission note, and the browser tool, each in a workspace holding only `.gitkeep`.

Requests, verbatim; the Club request named `./club-run`, Club and port 5222:

> /neon:neon-create Create a campaign landing page in ./exclusive-run for Finnomena Exclusive Run 2026, a 5 km and 10 km fun run for Finnomena Exclusive members at Lumpini Park on Sunday 6 December 2026, from the Exclusive · Run Theme Brief. Use mock data. Run its dev server on port 5221.

The evaluator served each app's `dist` and measured it in headless Chromium at 1440×900 and 375×812 after scrolling the page once, as in [campaign direction](campaign-direction.md), then looked at the full-page and first-screen captures.

| Observed at 1440px | Exclusive · Run (`event-poster`) | Club · Run (`event-landing`) |
| --- | --- | --- |
| Hero | Poster: the event name at 92px (`display1`) stacked over the date and place, no image beside it | Split: the event name at 60px beside a date block whose numeral is 92px |
| Section grounds, in page order | Canvas hero, Yellow 75 band, canvas, Light Grey 100 band, canvas, Yellow 75 band, canvas: the brief's table row for row | Yellow 50 hero, canvas, Yellow 100 band, Light Grey 100 band, then canvas: the brief's table row for row |
| Lead facts | Both distances, the 06:00 start and the deadline at 60px (`display2`) | Both distances, the 05:30 start and the deadline at 54px (`display3`) |
| Block shapes | 16px on the cards and 48px on the route block and the form block | 24px on the cards and 40px on three larger blocks, the call-out and the route block among them |
| Departures in the report | No Brand Pattern file; a drawn route in place of the map slot; the cards' select actions as secondary actions; `display3` for the name at 375px | No Brand Pattern file |
| Cost, turns, time | $4.54, 147 turns, 11 min | $3.40, 100 turns, 9 min |
| Verdict | Pass | Pass |

The Club page of the [campaign direction](campaign-direction.md) record kept one radius on every block and listed its display roles and its deadline band as departures from the brief. Here both pages took those from the brief, and the two pages no longer share a skeleton: the hero, the order of the call-out and the route, the radii and the fact size all differ. Neither page overflowed sideways at either width. Both wrote the direction lines and one motion moment, the schedule rows.

What the runs showed the briefs still get wrong:

- Each brief's Race distance card gave its select action `--immersive-action`. The Exclusive run refused it, since two main actions would sit side by side, and used the secondary action. The briefs were redrafted afterwards: the card no longer takes the `action` role, the prompt makes its action the Secondary Action, and a soft check holds a component without the role to that. No page was built from the redrafted briefs.
- On Exclusive and Ultra the Pattern's ground is the canvas, so with no Pattern file the hero is the bare canvas.

Run logs, reports and apps are in `.local/evals/format-{exclusive,club}`; captures and the measuring script are in `.local/evals/format-shots`.

Limits:

- One sample per brief. Ultra and Private did not run, so `event-poster` on a dark canvas is unobserved.
- The four briefs are trial drafts under `maintainer-sign-in`. A redraft under a neutral account changes their prose, and these runs do not cover it.
- The evaluator wrote the change and judged the captures. No blind judge compared them.
- The runner reported both cases as failed: its diff step met the app's own repository inside the workspace. Each run had already ended on its result event, with no void.
- No Brand Pattern file, photograph or map was supplied, so a Pattern on its ground and a supplied lead image under the poster hero were not exercised.
- Reduced motion was read from the CSS and script, not emulated.
- Costs are each run's last reported `total_cost_usd`.
