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
- **The Pattern departs from its picks.** Each run drew a Pattern with Block's engine and then changed it: the brief's colourway vanishes on Exclusive's canvas, Club's sits in a white panel because the engine draws on white, and Ultra's is navy on light grey because the engine draws no navy blocks on navy. All four cut it down to a strip after looking at the first render.
- **The narrow-screen name is uneven.** `event-poster` says the name drops one display role; Exclusive did, Ultra did not. On `event-landing`, which does not say, Club and Private dropped to 28px.

Run logs, reports and apps are in `.local/evals/final-{exclusive,club,ultra,private}`; captures and the measuring script are in `.local/evals/final-shots`.

## Brief changes after these runs

The five findings above changed the brief tool and the four briefs. Each line below is what a brief now says. What a page did with it is under "Runs on the changed briefs".

- **Secondary Action.** Neon's `secondary` button: `--immersive-palette-75` fill with its `on-` label. On a block that already has that fill, `ghost`. A component paragraph that outlines an action is sent back.
- **Main action on a fill where it does not read.** The Main Action entry lists the block fills whose text is not the action's color. There the button takes the fill's `on-` text variable and its label the fill's own. Only Ultra has such fills: its lighter palette steps, its accent and its support. A component with the action role that names `--immersive-action` on one of them is sent back.
- **Feature block on an edge-to-edge ground.** The Layout section says a component whose fill is its section's ground steps one lighter in the same family. The skill reference says a feature component is one block spanning the content column.
- **Brand Pattern.** A picks file names a Block Colourway from Block's primary group, checked against the theme's colors: Club `white__yellow-100`, Exclusive and Private `grey__yellow-100`, Ultra `navy__grey-100`. The brief places the Pattern on the section when Block draws on its fill and in a panel when it does not, as a strip beside or under the text.
- **Narrow-screen name.** `event-landing` now says the name drops one display role, as `event-poster` did. Ultra's miss on `event-poster` was against a brief that already said so, and stays one sample.

## Runs on the changed briefs

All four briefs as `fd6e2e9` holds them, one request each, two at a time, with the same requests, runner, model and measuring script as the second set. The package was that checkout at plugin 0.7.0.

| Observed at 1440px | Exclusive · Run (`event-poster`) | Club · Run (`event-landing`) | Ultra · Run (`event-poster`) | Private · Run (`event-landing`) |
| --- | --- | --- | --- | --- |
| Hero | Poster: the name at 92px over the date at 54px | Split: the name at 54px beside a date block whose numeral is 92px | Poster: the name at 92px over the date and place | Split: the name at 92px beside a date block whose numeral is 92px |
| Section grounds | The brief's table row for row | The brief's table row for row | The brief's table row for row | The brief's table row for row |
| Lead facts | 60px (`display2`) | 54px (`display3`) | 60px | 54px |
| Card select action | Neon's `secondary` button, `--immersive-palette-75` fill, no border | The same | The same | The same |
| Hero's second action | `secondary` | `ghost`, on the accent 50 ground | None | `secondary` |
| Main action in the call-out | Navy with a White label | Navy with a White label | Navy fill, label in the block's own fill | Navy with a White label |
| Feature blocks | 48px on the route block and the call-out, each lighter than its ground | 40px on the call-out and the route block, each lighter than its ground | 48px on the route block and the call-out, each lighter than its ground | 40px on the call-out and the route block, each lighter than its ground |
| Brand Pattern | `grey__yellow-100` in a Light Grey panel on the Yellow hero | `white__yellow-100` in a White panel beside the text | `navy__grey-100` on the ground, edge to edge under the text | `grey__yellow-100` on the ground, edge to edge under the text |
| Name at 375px | 60px, one role down | 54px, unchanged | 60px, one role down | 60px, one role down |
| Cost, turns, time | $4.07, 108 turns, 10 min | $3.76, 95 turns, 9 min | $4.19, 113 turns, 10 min | $3.92, 102 turns, 9 min |
| Verdict | Pass, with the panel's edge lost | Pass | Pass | Pass |

Each of the five changes shows on a page:

- **Secondary Action.** All eight card select actions are Neon's `secondary` button with no border. No run drew an outline.
- **Ultra's main action.** In the call-out it is Navy with its label in the block's fill. In the hero and the form, on Navy grounds, it stays White.
- **Feature block on an edge-to-edge ground.** All eight feature blocks show their radius against the section. Ultra's route block now takes 48px. Ultra's call-out stepped from accent 100 to accent 25, three steps where the brief says one.
- **Brand Pattern.** Every Pattern has the two colors of the brief's Block Colourway and runs as a strip. Club and Exclusive put it in a panel, Ultra and Private on the ground. No report lists the Pattern's colors as a departure.
- **Narrow-screen name.** Exclusive, Ultra and Private drop from `display1` to `display2`. Club's name is `display3` at both widths.

What these runs showed:

- **Exclusive's panel loses its edge.** `grey__yellow-100` draws Yellow blocks, and the hero's ground is Yellow. Where a block meets the panel's side the panel has no edge, and its top right corner is cut away. The picks check compares a Block Colourway's colors with the theme's colors, not its blocks with the section's fill.
- **A name already at `display3` has no role to drop to.** Club set the name in `display3` beside a `display1` numeral, so the narrow-screen rule changed nothing. The brief gives the numeral block no role, and the numeral outranks the name at both widths.
- **Club's hero drew its second action as `ghost`.** The brief keeps `ghost` for a block with the `--immersive-palette-75` fill. Club's hero is accent 50, where the Light Grey `secondary` button would sit on Yellow.

None overflowed sideways at either width. Run logs, reports and apps are in `.local/evals/gaps-{exclusive,club,ultra,private}`; captures and the two measuring scripts are in `.local/evals/gaps-shots`.

## Brief changes after the third set

The three findings changed the brief tool and the four briefs. The [fourth set](#runs-after-the-third-sets-changes) was built from them.

- **Panel edge.** A picks file is refused when its Pattern sits in a panel and the Block Colourway's blocks are the section's fill. Exclusive's pick is now `grey__navy-100`, Navy blocks on Light Grey.
- **Hero name role.** A layout preset names `nameRole`, `display1` or `display2`. The Picks list gives it with the role one below for narrow screens, and says nothing else in the hero is set larger. Both layouts take `display1`.
- **Secondary Action on an accent or support fill.** The entry now says `ghost` there, as on a block with the `--immersive-palette-75` fill. A component paragraph that fills a Secondary Action with that variable on an accent or support fill is sent back.

Only scripted sections changed. No prose was redrafted: the records show `occasion-components` and `layout` drafted from the earlier entry and presets, and no component paragraph puts a Secondary Action on an accent or support fill.

## Runs after the third set's changes

All four briefs as `b3af6b3` holds them, one request each, two at a time, with the same requests, runner, model and measuring scripts as the third set. The package was that checkout at plugin 1.0.0.

| Observed at 1440px | Exclusive · Run (`event-poster`) | Club · Run (`event-landing`) | Ultra · Run (`event-poster`) | Private · Run (`event-landing`) |
| --- | --- | --- | --- | --- |
| Hero | Poster: the name at 92px, with the date, place and main action in a column beside it | Split: the name at 92px beside a date block whose numeral is 60px | Poster: the name at 92px over the date and place | Split: the name at 92px beside a date block whose numeral is 60px |
| Section grounds | The brief's table row for row | The brief's table row for row | The brief's table row for row | The brief's table row for row |
| Lead facts | 60px (`display2`) | 54px (`display3`) | 60px | 54px |
| Card select action | Neon's `secondary` button, `--immersive-palette-75` fill, no border | The same | The same | The same |
| Hero's second action | None | `ghost`, on the accent 50 ground | `secondary`, on the Navy ground | None |
| Main action in the call-out | Navy with a White label | Navy with a White label | Navy fill, label in the block's own fill | Navy with a White label |
| Feature blocks | 48px; the route block two steps lighter than its ground, the call-out one | 40px; the call-out one step lighter, the route block two | 48px; both one step lighter | 40px; the call-out two steps lighter, the route block one |
| Brand Pattern | `grey__navy-100` in a Light Grey panel under the hero's text | `white__yellow-100` in a White panel under the text | `navy__grey-100` on the ground, edge to edge under the text | `grey__yellow-100` on the ground, edge to edge under the text |
| Name at 375px | 60px, one role down | 60px, one role down | 60px, one role down | 60px, one role down, on three lines |
| Cost, turns, time | $4.30, 120 turns, 15 min | $4.14, 128 turns, 15 min | $4.19, 124 turns, 12 min | $3.91, 102 turns, 12 min |
| Verdict | Pass | Pass | Pass | Pass, with the name on three lines at 375px |

Each of the three changes shows on a page:

- **Panel edge.** Exclusive's panel draws Navy blocks on Light Grey, and all four sides and corners show against the Yellow hero at both widths.
- **Hero name role.** All four names are `display1` at 1440px and `display2` at 375px, and nothing in a hero is larger. Club's name went from 54px to 92px, and both date numerals dropped from 92px to 60px. Club's report says the numeral is larger than the brief gives it and smaller than the name.
- **Secondary Action on an accent fill.** Club's hero, on accent 50, draws its second action as `ghost`, which the entry now names. Ultra's hero, on Navy, draws it as `secondary`.

Ultra's call-out is one step lighter than its ground, where the third set's was three.

What these runs showed:

- **A long name takes three lines at 375px.** "Finnomena Private Run 2026" at `display2` wraps to three lines, where `skills/neon-create/references/campaign-content.md` asks for two or fewer. The run kept the brief's size and reported it. Exclusive moved "Finnomena" to a line above the name to stay at two.
- **The date numeral equals the name at 375px on Private.** Both are 60px. The brief gives the date block no role, so "nothing larger" holds and the two tie.
- **Feature blocks step one or two lighter.** The brief says one. Three of the eight blocks took two.
- **Exclusive's report lists the main action in the hero and the form as a departure.** The brief's Main Action entry is the main action of a section, so the page is within the brief and the report over-reports.

Outside the brief: Club's report says the layout starter renders an empty 64px row under the logo, which the run moved the page up over in its own CSS.

None overflowed sideways at either width. Run logs, reports and apps are in `.local/evals/name-{exclusive,club,ultra,private}`; captures are in `.local/evals/name-shots`.

## Skill change after the fourth set

The three-line name changed `skills/neon-create/references/theme-brief.md`: a name that takes more than two lines at the hero name role keeps the role, and the organisation's name that opens it moves to a line above in a label or title role. A name still past two lines keeps the role and the report gives its line count. `campaign-content.md` points its two-line rule there. No brief changed. No page was built from this change.

## Limits

- One sample per brief in each set of runs.
- The third and fourth sets observe each brief change once.
- The four briefs are trial drafts under `maintainer-sign-in`. A redraft under a neutral account changes their prose, and these runs do not cover it.
- The evaluator wrote the change and judged the captures. No blind judge compared them.
- The runner reported every case as failed: its diff step met the app's own repository inside the workspace. Each run had already ended on its result event, with no void.
- No Brand Pattern file, photograph or map was supplied. The first runs had no Pattern; the later sets drew their own. A supplied lead image under the poster hero was not exercised.
- Reduced motion was read from the CSS and script, not emulated.
- Costs are each run's last reported `total_cost_usd`.
