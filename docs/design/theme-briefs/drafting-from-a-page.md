# Draft a layout preset from a page

## Read when

Read this before you draft a layout preset from a web page. You do not need it for a preset written by hand, which follows the same carry-over rule and review gate in [the Theme Brief write-up](../theme-briefs.md).

## What carries over

Under [ADR 0007](../../adr/0007-theme-brief-presets-borrow-only-structure-from-named-public-pages.md), a preset keeps only three things from a page:

- **Structure:** the section roles, in page order.
- **Geometry:** block radius, section gap, card padding, page width and density.
- **Motion:** the motion level.

Colors and type come from the Immersive Theme. Logos, imagery, copy, names and prose from the page never carry over. The tool drafts layout presets only, so write an imagery preset by hand.

## Choose the page

Name one public page. Prefer Finnomena's own pages. The tool does not discover or crawl pages, and you are responsible for the site's terms of use. A Refero Styles page is never a source, and the tool refuses one.

## Run the draft

```sh
node scripts/probe-page.mjs --draft-preset <slug> https://<page>
```

The tool measures the page at 1440px in a temporary Chrome profile that is never signed in, then removes the profile. It writes three files to a new temp directory: the draft `<slug>.json`, the raw `probe.json` and a screenshot. Raw output is never committed. An `--out` inside the Neon repository is refused unless it is under `.local/`, and so is one inside the current directory.

These stop the run with `Preset draft: not measured; <reason>`, and the tool exits 1 with no draft:

- HTTP 401, 403 or 429;
- a sign-in wall: a visible password field, or a redirect to a sign-in path;
- a bot challenge or CAPTCHA;
- no Chrome, or a page that does not load.

There is no workaround for a stop. Choose another page or write the preset by hand. Never sign in, change the user agent, retry in a loop or solve a challenge.

A robots.txt disallow does not stop the run. The tool matches the page's path against the groups for its product token `neon-probe`, or `*` when no group names it, using the RFC 9309 rules. It prints a warning and records the disallow as `source.robotsDisallowed: true` for the reviewer. A robots.txt that answers 5xx or cannot be reached counts as a disallow, and a missing one (4xx) allows the page.

## How values are drafted

The values are provisional, pending the design owner's review.

| Field | Drafted from |
| --- | --- |
| `sections` | The children of `<main>`, or of the first element with more than one visible child, plus the page footer. The first section is `hero`. Then `form` (a form, or two inputs), `proof` (a quote), `detail-list` (a list of three or more items), otherwise `call-out`. |
| `blockRadius` | The most common radius among filled blocks: blocks with a fill unlike what is behind them, a border or a shadow, excluding controls and images. |
| `cardPadding` | The median padding of those blocks. |
| `sectionGap` | The median space above each section after the first: the gap from the previous section, or the section's top padding when that is larger. |
| `pageWidth` | `full-bleed` when a section's fill or image spans the viewport, otherwise `contained`. |
| `density` | From the card padding step: `compact` up to 16px, `comfortable` up to 32px, `spacious` above. |
| `motion` | The median transition or animation length: `still` up to 150ms, `subtle` up to 250ms, `lively` above. With no transition or animation, it is `still`. |
| `brandPattern.section` | `hero`, or the first section if there is no hero. |
| `source` | The named URL without its fragment, today's date, `kept: ["structure", "geometry", "motion"]` and the robots.txt result. |

Each measured px value snaps to the nearest `--space-*` or `--borderRadius-*` step in `theme/css/theme.css`. A tie goes to the smaller step. Values past the scale cap at its last step: `space-10`, or `borderRadius-900` for a radius. A full-round radius, at least half the block's shorter side or 50%, becomes `borderRadius-1000`. When nothing is measured for a field, the tool says so and you set it by hand.

## Finish the preset

1. Write `heroPattern`, `navigation` and `footer` as your own short intent notes, replacing the `maintainer to write:` placeholders. Never copy wording from the page.
2. Check every field against the screenshot, and correct any roles the heuristics got wrong.
3. Save it under `theme-briefs/` as `presets/layout/<slug>.json`, then run the Theme Brief check.
4. A brief that uses a preset sourced outside finnomena.com needs a review record in its picks file before it ships. See [the Theme Brief write-up](../theme-briefs.md).
