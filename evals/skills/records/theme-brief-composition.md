---
scenarios:
  - request: Build a Campaign Page for a members' fun run from the Exclusive · Run Theme Brief, with no images supplied
    observe: The hero is the brief's poster, not a split; each section sits on the ground its row of the brief's Layout table names; the distance, the start time and the registration deadline take the brief's lead fact role; the two feature blocks take the feature radius and the cards the block radius; the report lists where the build departs from the brief.
  - request: Build a Campaign Page for a members' fun run from the Club · Run Theme Brief, with no images supplied
    observe: The same checks against the Club brief's own table and picks, and a page whose hero, section order and radii differ from the Exclusive page's.
  - request: Build a Campaign Page for a members' fun run from the Ultra · Run Theme Brief, with no images supplied
    observe: The poster hero and the brief's grounds hold on the dark canvas; each distance card's select action is the Secondary Action, not a second main action; the main action stays readable on the accent ground; the route block takes the feature radius.
---

# Theme Brief composition

What a page built from a Theme Brief looks like once the brief carries [composition picks](../../../docs/design/theme-briefs.md#presets-and-picks-files): a ground per section, a lead fact role and a feature radius. These are the page-layer runs for the `event-poster` layout and for `event-landing` with its new fields: two [first runs](#first-runs), then [all four briefs](#runs-on-the-redrafted-briefs) after a redraft.

## First runs

Two requests ran once each at the same time, November 2026, on the working tree later committed as `59792c7`, with the four briefs as that commit holds them; the briefs changed once more after the runs, as noted below. The runs used Claude Code 2.1.323 with `run-claude-case.mjs --model claude-opus-5-5 --serve-registry`, the runner's allowlist and permission note, and the browser tool, each in a workspace holding only `.gitkeep`.

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

- Each brief's Race distance card gave its select action `--immersive-action`. The Exclusive run refused it, since two main actions would sit side by side, and used the secondary action. The briefs were redrafted afterwards: the card no longer takes the `action` role, the prompt makes its action the Secondary Action, and a soft check holds a component without the role to that. The [second runs](#runs-on-the-redrafted-briefs) built from the redrafted briefs.
- On Exclusive and Ultra the Pattern's ground is the canvas, so with no Pattern file the hero is the bare canvas.

Run logs, reports and apps are in `.local/evals/format-{exclusive,club}`; captures and the measuring script are in `.local/evals/format-shots`.

## Runs on the redrafted briefs

All four briefs as `d3f3fe6` holds them, one request each, two at a time, on the same day with the same runner, model and measuring script. The package was this branch after its merge of `main` at plugin 0.7.0, which brings Block's Brand Pattern procedure. The requests are the one above with the theme's name, folder and port changed.

| Observed at 1440px | Exclusive · Run (`event-poster`) | Club · Run (`event-landing`) | Ultra · Run (`event-poster`) | Private · Run (`event-landing`) |
| --- | --- | --- | --- | --- |
| Hero | Poster: the name at 92px over the date and place at 54px | Split: the name at 54px beside a date block whose numeral is 92px | Poster: the name at 92px over the date at 28px | Split: the name at 54px beside a date block at 92px |
| Section grounds | The brief's table row for row | The brief's table row for row | The brief's table row for row | The brief's table row for row |
| Lead facts | Distances, start and deadline at 60px (`display2`) | Distances, start and deadline at 54px (`display3`) | Distances, start and deadline at 60px | Distances, start and deadline at 54px |
| Block shapes | 16px cards, 48px on the route block | 24px cards, 40px on three larger blocks | 16px on every block; no 48px block | 24px cards, 40px on three larger blocks |
| Card select action | No fill, outlined | Neon's filled `secondary` button | Neon's filled `secondary` button | No fill, a border drawn by hand |
| Name at 375px | 60px, one role down | 28px | 92px, not stepped down | 28px |
| Brand Pattern | A strip from Block's engine, white with yellow | A strip in its own white panel | A strip, navy on light grey | A strip under the hero text |
| Cost, turns, time | $3.89, 111 turns, 10 min | $4.03, 111 turns, 11 min | $6.02, 164 turns, 15 min | $4.83, 147 turns, 12 min |
| Verdict | Pass | Pass, with the card action filled | Fail: no feature radius, the name not stepped down at 375px | Pass |

No run filled a card's select action with the main action's color, so no page shows two main actions side by side. All four wrote the five direction lines and kept motion to the schedule rows, with a sticky action bar as a second moment on Exclusive and Ultra. None overflowed sideways at either width. `event-poster` holds on Ultra's dark canvas: the grounds, the poster stack and the lead fact role all follow the brief.

What these runs showed:

- **The Secondary Action has no Neon button.** The brief words it as a `Button` with no fill and an outline. Neon's `outline` variant has no value in Core, so it is not chosen for new work. Club and Ultra took the filled `secondary` button and listed it as a departure; Exclusive and Private drew the outline themselves. The brief's wording predates this branch; which button the Secondary Action is, is the design owner's call.
- **Ultra's main action is unreadable on its accent ground.** The call-out sits on Yellow, and Ultra's main action is White with about 1.1:1 against it. The run filled that button with Navy and reported it. The brief does not say what the main action takes on an accent ground.
- **A feature block on an edge-to-edge ground shows no radius.** On `event-poster` the call-out is a feature component on the accent section, which fills edge to edge, so its 48px corners never show (Exclusive and Ultra both reported it). On Ultra the route block did not take the feature radius either.
- **The Pattern departs from its picks.** Each run drew a Pattern with Block's engine and then changed it: the brief's colourway vanishes on Exclusive's canvas, Club's sits in a white panel because the engine draws on white, and Ultra's is navy on light grey because the engine has no navy ground. All four cut it down to a strip after looking at the first render.
- **The narrow-screen name is uneven.** `event-poster` says the name drops one display role; Exclusive did, Ultra did not. On `event-landing`, which does not say, Club and Private dropped to 28px.

Run logs, reports and apps are in `.local/evals/final-{exclusive,club,ultra,private}`; captures and the measuring script are in `.local/evals/final-shots`.

## Limits

- One sample per brief in each set of runs.
- The four briefs are trial drafts under `maintainer-sign-in`. A redraft under a neutral account changes their prose, and these runs do not cover it.
- The evaluator wrote the change and judged the captures. No blind judge compared them.
- The runner reported every case as failed: its diff step met the app's own repository inside the workspace. Each run had already ended on its result event, with no void.
- No Brand Pattern file, photograph or map was supplied. The first runs had no Pattern; the second drew their own. A supplied lead image under the poster hero was not exercised.
- Reduced motion was read from the CSS and script, not emulated.
- Costs are each run's last reported `total_cost_usd`.
