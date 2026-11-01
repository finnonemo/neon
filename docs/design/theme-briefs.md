# Author Theme Briefs

## Read when

Read this before you change a preset, picks file, theme text or prompt library entry, before you add or review a Theme Brief, or when the Theme Brief check fails in CI.

Fast path: to change a preset or picks file, edit it and run the check below until it reports no problems. If it reports that a published brief's section differs from fresh scripted output, refresh it with `scripted-only` (see [Section map](#section-map)). Then run `node scripts/validate.mjs`.

```sh
node scripts/theme-briefs/theme-briefs.mjs check-only
```

The tool and its data are for maintainers only. Neither ships in the plugin; only the published brief Markdown does, as a registry item.

## Why this method

An employee who builds a Campaign Page on an Immersive Theme gets its colors and type, and nothing more. Each page then re-invents its layout, components, imagery and motion. A Theme Brief gives that page a Finnomena-made starting point that keeps the theme's typeface and colors fixed.

- [ADR 0005](../adr/0005-immersive-pages-start-from-a-guideline-theme.md): the theme fixes the colors. A brief only chooses where its families and steps go.
- [ADR 0001](../adr/0001-employees-bring-reference-designs.md): Neon ships no third-party reference design. A brief is Finnomena-made, and one drawn from a third-party page ships only after a design review in the [example library](example-library.md).
- [ADR 0007](../adr/0007-theme-brief-presets-borrow-only-structure-from-named-public-pages.md): a preset may borrow structure, geometry and motion from a named public page, never its colors, type, imagery, copy or name.

Every value comes from the theme and Neon's tokens, and CI checks committed briefs and their inputs against both.

## What a Theme Brief is

A Theme Brief is a Markdown file in the Refero Styles section order, one per Immersive Theme and occasion, headed `# Finnomena <Theme> · <Brief name> — Theme Brief`. It combines one occasion, one layout and one imagery Preset with a theme and a Brand Pattern colourway. The value sections are scripted from the theme and tokens. The prose comes from a model, through the prompt library, and a maintainer reviews it.

A published brief is the Markdown `<theme>-<slug>.md` in `registry/theme-briefs`, plus its registry entry `theme-brief-<theme>-<slug>`. Its maintainer files stay under `theme-briefs/`:

| Maintainer term | File | Holds |
| --- | --- | --- |
| Preset | `presets/<kind>/<slug>.json`, where kind is `occasion`, `layout` or `imagery` | One reusable choice, written as short intent notes |
| Picks file | `picks/<theme>-<slug>.json` | The theme, brief name, the three presets, the Brand Pattern colourway and ground, and a review record when needed |
| Theme text | `themes/<theme>.json` | The theme's `mood` (2–4 sentences) and `sibling` line (20 words or fewer) |
| Prompt library | `prompt-library/<entry>.json` plus `shared.json` | How the model drafts each prose section |
| Authoring record | `records/<theme>-<slug>.json` | What produced the published brief |

Drafts and review reports go to `.local/` and are never committed.

## Section map

[`render.mjs`](../../scripts/theme-briefs/render.mjs) renders every scripted part from the theme, Neon's tokens and the picks file. Prose comes from the model through the prompt library entry named in the last column; a maintainer may edit it by hand.

| # | Section | Scripted | Prose |
| --- | --- | --- | --- |
| 0 | Header | title, `**Theme:**` and `**Immersive Theme:**` labels, status paragraph, the mood's theme half (the theme text) and membership ratio line | tagline (`tagline`); the mood's occasion half (`mood-occasion`) |
| 1 | Tokens — Colors | the theme's roles and steps, canvas first, and the shared secondary table | — |
| 2 | Tokens — Typography | the typeface and every type role | — |
| 3 | Tokens — Spacing & Shapes | the space and radius scales, a Layout table with `--layout-contentMaxWidth` and `--layout-endMargin` in px, and the layout picks | — |
| 4 | Components | Main Action, Secondary Action, Logo, Tint Block, Accent Block, and Support Block on a theme with `support` | the occasion's components (`occasion-components`) |
| 5 | Do's and Don'ts | the stock bullets, first in each list | the preset bullets, last in each list (`preset-dos-donts`) |
| 6 | Surfaces | canvas, block steps and the first accent and support steps | — |
| 7 | Elevation | none | — |
| 8 | Imagery | the Brand Floor sentence, the last paragraph | the paragraphs before it (`imagery`) |
| 9 | Brand Pattern | section, colourway and ground | — |
| 10 | Layout | — | one paragraph (`layout`) |
| 11 | Motion | the level's vocabulary and the reduced-motion rule | — |
| 12 | Agent Prompt Guide | the Quick Color Reference | prompts after **Example Component Prompts** (`example-prompts`) |
| 13 | Sibling Themes | each other theme's label, light or dark, canvas and its `sibling` text | — |
| 14 | Quick Start | registry items and Tailwind v4 `@theme inline` aliases | — |

Scripted wording holds for every colourway, and fixed components name tokens and steps, never px. Every px value appears in the brief's own tables.

To refresh a brief after its theme, tokens or picks change, run:

```sh
node scripts/theme-briefs/theme-briefs.mjs scripted-only
```

It rewrites the scripted parts of every brief in `registry/theme-briefs` (or `--out <dir>`) and keeps the prose byte for byte. Prose is read by position, as the table gives it: the mood's middle lines, the components after the fixed ones, the last bullets of each list, and so on. Keep those positions when you edit prose by hand. A brief whose prose or inputs cannot be read is reported and left as it is.

## Presets and picks files

[`schemas.mjs`](../../scripts/theme-briefs/schemas.mjs) holds the closed schemas: every object rejects keys it does not name. Everywhere in these files:

- Colors come from the theme, so no value may look like a hex color.
- Type comes from the theme, so no key may name a font or typeface.
- Spacing and radius are step names (`space-4`, `borderRadius-500`), never px.

**Occasion presets** have 2–6 components. Each names the roles it uses: `palette`, `accent`, `support` or `action`. They also have 1–3 do's and 1–3 don'ts, their prompt inputs and any secondary highlights.

**Layout presets** list generic section roles (`hero`, `proof`, `detail-list`, `call-out`, `form`, `footer`) and a density. They give block radius, section gap and card padding as steps, a page width of `contained` or `full-bleed`, and a motion level of `still`, `subtle` or `lively`. The Brand Pattern's section must be one of the layout's own roles.

**Imagery presets** describe what leads, framing, subject, illustration and density.

A layout or imagery preset drafted from a page records it in `source`. The URL is https with no fragment. The record also holds the date measured, which of structure, geometry and motion were kept, and whether robots.txt disallowed the page. A Refero Styles page is never a source. The source is provenance only: it is never a drafting input, and no name from it may appear in a brief.

A **picks file** is named after its theme and brief name: theme `club` with brief name `Run` gives `club-run.json`. Its choices must fit the theme:

- Every role an occasion component uses exists on the theme. Every theme has `action` and its own families; only some have `support`.
- The colourway is one of the theme's own families, never a secondary color, and the ground is a step of it.
- A Brand Pattern sits on the bare canvas only as `palette` 100. A ground whose fill is the theme's canvas color under any other colourway or step is refused. On Club, whose palette 100 is a grey tint, every Pattern therefore sits on a tinted section.

When any chosen preset has a source outside finnomena.com, the picks file needs a `review` record in the [example library](example-library.md) shape. It holds `status`, `source_revision`, `reviewer`, `reviewed_on` and `approved_properties`. Its status must be past `illustrative`, with the reviewer and date filled in, and a `partially-reviewed` record lists its approved properties. A source URL the tool cannot read counts as third-party. A picks file with no such source carries no review record.

**Theme texts** stay true when a theme is added. They hold no ratio or percentage, no superlative and no comparison with another theme.

## Checks

The check module in `scripts/theme-briefs` is shared by the tool's `check-only` mode and by `evals/skills/theme-briefs.test.mjs`, which runs it over this repository in `node scripts/validate.mjs`. Every problem is listed as `<path>: <message>`. Each line names the file to fix:

| Failure | Meaning and fix |
| --- | --- |
| `not valid JSON`, `unknown key`, `missing key`, `must be one of`, `must have N items`, `must match the file name` | The file does not match its schema. Fix the syntax, key, value or count the message names. |
| `file name must be "<theme>-<slug>.json"` | A picks file is named apart from its theme and brief name. Rename the file or fix the brief name. |
| `no Immersive Theme`, `must be 2–4 sentences`, `must be 20 words or fewer` | A theme text names no theme, or its `mood` or `sibling` is the wrong length. |
| `not a prompt library entry`, `names a preset source`, `names the entry itself` | A prompt library entry has an unknown name, takes a source as input, or runs after itself. |
| `is a Refero Styles page` | A preset names the Refero corpus as its source. Draft from another page. |
| `holds a hex-like value`, `holds a px value`, `is a font field` | An input carries a value the theme owns. Describe the intent instead, and use a step name. |
| `compares or ranks themes`, `holds a ratio or percentage` | A theme text will go stale when themes change. Describe the theme on its own terms. |
| `uses role … which <Theme> lacks`, `is not one of <Theme>'s families`, `is not a step of`, `bare canvas` | The picks file does not fit its theme. Choose another preset, colourway or ground. |
| `Brand Pattern section … is not one of its sections` | A layout places the Pattern in a section it does not have. |
| `preset … not found` | A picks file names a preset with no file. Add the preset or fix the slug. |
| `needs a review record`, `review status is "illustrative"`, `needs a reviewer and reviewed_on` | A third-party source needs a recorded Finnomena design review before its picks file is committed. Record the review, or choose presets with no third-party source. |
| `review record without a third-party source` | None of the chosen presets needs a review. Remove the record. |
| `published brief … has no …` | A published brief is missing its picks file, Markdown, authoring record or registry entry. Add the missing part, or remove the others. |
| `is not a color token`, `which <Theme> does not define`, `text needs 4.5:1`, `an action's edge needs 3:1` | A brief names a color or pair the theme cannot back. Use a token, or a variable and pair the theme defines and keeps readable. |
| `names "<name>", a preset source` | A source's site or domain name appears in a brief. Remove it. |
| `differs from fresh scripted output`, `sections must be, in order` | A scripted part no longer matches the theme, tokens or picks, or was edited by hand. Run `scripted-only`, and put lasting wording changes in `render.mjs`. |
| `its scripted sections cannot be checked`, `not rewritten` | The brief's prose cannot be found where the section map puts it, or a rewrite would drop hand-added text, such as an extra bullet, section or header paragraph, or a paragraph after the Brand Floor sentence; or its inputs have problems. Move or remove the text the message names, or fix the inputs listed first. |
| `takes the name of a fixed component` | An occasion component is named like one the brief renders itself. Rename it. |

The registry tests also run in `validate.mjs`, so a brief's registry entry must build like every other item.
