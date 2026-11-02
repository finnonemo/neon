# Author Theme Briefs

## Read when

Read this before you change a preset, picks file, theme text or prompt library entry, before you add or review a Theme Brief or add an Immersive Theme, or when the Theme Brief check fails in CI.

Fast path: to change a preset or picks file, edit it and run the check below until it reports no problems. If it reports that a published brief's section differs from fresh scripted output, refresh it with `scripted-only` (see [Section map](#section-map)). Then run `node scripts/validate.mjs`.

```sh
node scripts/theme-briefs/theme-briefs.mjs check-only
```

To draft a brief's prose with Claude Code, see [Author a brief](#author-a-brief).

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

## Author a brief

Commit the brief's picks file and every theme text, sign in to Claude Code, and run the tool with the brief's name. `draft` is the default mode:

```sh
node scripts/theme-briefs/theme-briefs.mjs club-run
```

The tool drafts the prose one prompt library entry at a time, in `after` order. Each call is `claude -p` with `claude-opus-5-5` at high effort, run from an empty folder with no tools, MCP servers, project settings or saved session. `CLAUDE_PATH` names another executable; the tests point it at a fake.

- **Inputs.** An entry gets only the `inputs` it declares: preset fields, theme text and facts, the picks, computed lists and earlier entries' output. Neither a preset's `source` nor the picks file's `review` is ever an input. The shared file fills `{{variables}}` with the variables prose may name and `{{typeRoles}}` with the type roles.
- **Checks on each answer.** Hard checks refuse an answer. They cover its shape against the entry's `output` and whatever would stop the brief reading its prose back. They also cover the values in check 4, a fill named with another fill's text in check 6, the accent placement in check 10, eight words copied from the example, and a source name. Soft checks send an answer back: the `targets` word bands, one sentence per Do and Don't, component paragraph slots in order (fill, border, radius, padding), a Don't that starts "Do not" and gives its reason after " — ", a sentence-case tagline, agreement with the presets, and a fill named with no text.
- **Retries.** An entry gets up to three attempts, and each retry is sent the last attempt's misses. The tool keeps the attempt that passes the hard checks with the fewest soft misses, the earliest on a tie. Later entries take the kept attempt.
- **Writes.** Every run writes a draft, a review report and a run record to `.local/theme-briefs/<brief>/`. The run record is the authoring record the run would commit, with `null` for what an entry did not produce. The review gives each entry's hash and inputs, its attempts and their misses, a diff against the committed brief, and the word overlap per model section with other briefs on the same theme. When every entry passes, and the whole brief passes checks 3, 4, 5, 6, 7 and 10, the tool also writes the brief to the registry and its authoring record to the `records` folder beside the prompt library. Otherwise it exits 1, and the draft shows `**Hard checks failed — <entry>:**` or `**Not drafted — <entry>:**` under each section it could not fill.
- **Claude Code fails.** If Claude Code cannot answer, the run stops and writes nothing. That covers a missing sign-in, a missing executable and a timeout. It does not count as an attempt.
- **Flags.** `--model <id>` drafts with another model, and the record notes the override. `--account` labels who signed Claude Code in: `maintainer-sign-in` (the default), `neutral-account` or `neutral-key`. `--out`, `--local` and `--root` move the brief, the draft folder and the repository.

The authoring record holds versions, labels and hashes only:

- the tool's commit and a hash of its modules;
- the Claude Code version, model, effort and account label;
- for each entry, SHA-256 hashes of the entry, `shared.json`, its inputs and its output as read back from the brief;
- each attempt's count of hard and soft misses;
- the accent placement.

It holds no prompt, answer, path, account or session detail. The tests confirm this against a fake.

A brief the tool writes is not yet published: [review and publish](#review-and-publish) it.

### Hand edits

A section is hand-edited when its prose, read back from the brief, no longer matches the output hash in its record. Two modes keep hand edits safe from the model. `draft` itself rewrites every entry, so rerun a committed brief with `redraft`.

**accept** writes a local draft you fixed by hand:

```sh
node scripts/theme-briefs/theme-briefs.mjs accept club-run
```

- It reads the local draft and its run record from `.local/theme-briefs/<brief>/`, so run `draft` or `redraft` first.
- It refuses a draft that still holds a `**Hard checks failed —**`, `**Not drafted —**` or `**Brief checks failed:**` marker, or `[not drafted]`. Replace each with the section's prose.
- It reruns every check on the prose as the draft reads: each entry's hard checks, then checks 3, 4, 5, 6, 7 and 10 on the whole brief. A hard failure is listed as `<draft>: <entry>: <message>`, and nothing is written.
- Soft misses do not block. They are printed as `<brief>: warning — <entry>: <message>`.
- When every hard check passes, it writes the brief and its authoring record, and names the hand-edited sections. The record keeps the model's output hashes, or `null` where the model produced none, and marks each edited entry `"handEdited": true`. A later redraft still sees those sections as edited.
- The record keeps the run's accent placement while the mood paragraph still names it. Otherwise it takes the one placement the paragraph names.

**redraft** reruns entries of a committed brief:

```sh
node scripts/theme-briefs/theme-briefs.mjs redraft club-run occasion-components --discard layout
```

- It reruns the named entries and every entry `after` them. Naming `occasion-components` also reruns `preset-dos-donts`, `layout` and `example-prompts`.
- It reads the committed brief and its record, and refuses before any model call when an entry it would rerun is hand-edited. Name each such entry with `--discard <entry>` to overwrite it. A `--discard` that names an entry the run does not rerun is refused.
- Kept sections stay as the brief reads, hand edits included. They are the inputs for the rerun entries, and their record entries are copied unchanged.
- It writes as `draft` does: the local draft, review and run record always, and the brief and record only when every check passes. A failed redraft can be fixed by hand and accepted.
- It takes `draft`'s flags. The record's version, model and account fields describe the latest run.

Changing an entry file or `shared.json` never redrafts a brief. Each record entry keeps the hashes it was drafted from, so the record shows which briefs used an older one. `redraft` names each kept section drafted from an older entry or `shared.json`. Redrafting it is your choice.

Limits:

- A fill named with no text (check 6) is a warning in the review report only. Read each one: it may be a fill whose text the sentence leaves to the reader.
- A failure in a whole-brief check (3, 4, 5, 6, 7 or 10) is marked in the draft but not retried, since it belongs to no one entry. Each entry's own checks already cover checks 4, 6 and 10 and source names, so this failure is rare; fix it by hand or rerun.

## Review and publish

A brief is published when its Markdown, picks file, authoring record and registry entry are merged together. Publish in one PR:

1. **Review.** In `.local/theme-briefs/<brief>/`, read the draft against its review report. Check each entry's misses, the diff against the committed brief, and the word overlap with the theme's other briefs, so their model sections do not repeat each other. Read every warning for a fill named with no text. Fix prose by hand and `accept` it, or `redraft` the entry.
2. **Review record.** When a chosen preset has a third-party source, record the design review in the picks file's `review` before you commit it (see [Presets and picks files](#presets-and-picks-files)). A brief from Finnomena's own presets needs no record.
3. **Registry entry.** Add the brief's entry to `registry/registry.json`. The registry tests check it against the picks file and Markdown:

   ```json
   {
     "name": "theme-brief-club-run",
     "type": "registry:item",
     "title": "Club · Run",
     "description": "<the brief's tagline, the line after > in its header>",
     "categories": ["theme-brief", "club"],
     "meta": {
       "immersiveTheme": "club",
       "briefName": "Run",
       "presets": { "occasion": "run", "layout": "event-landing", "imagery": "people-in-action" },
       "status": "provisional"
     },
     "registryDependencies": ["@neon/theme", "@neon/immersive-themes"],
     "files": [{ "path": "theme-briefs/club-run.md", "type": "registry:file", "target": "~/docs/theme-briefs/club-run.md" }]
   }
   ```

   The title is the theme label and brief name, and `meta.presets` copies the picks file. The one file installs to `./docs/theme-briefs/` in the app.
4. **Build.** Run `node scripts/build-registry.mjs`. It inlines the Markdown into `registry/r/theme-brief-<theme>-<slug>.json`, pinned to the release tag like every item. A later edit to the brief needs the build again.
5. **Validate.** Run `check-only`, then `node scripts/validate.mjs`.
6. **PR.** Commit the Markdown, picks file, authoring record, registry entry and build, plus any new preset or theme text. Say in the PR which account label the record carries and who reviewed the draft. Nothing from `.local/` is committed.

A brief reaches employees only through a release that serves the registry.

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
| `has the same occasion, layout and imagery presets as` | Check 9: two picks files of one theme share all three presets, so they would be one design; a different colourway does not make them distinct. Change at least one preset in the file named first. |
| `Brand Pattern section … is not one of its sections` | A layout places the Pattern in a section it does not have. |
| `preset … not found` | A picks file names a preset with no file. Add the preset or fix the slug. |
| `needs a review record`, `review status is "illustrative"`, `needs a reviewer and reviewed_on` | A third-party source needs a recorded Finnomena design review before its picks file is committed. Record the review, or choose presets with no third-party source. |
| `review record without a third-party source` | None of the chosen presets needs a review. Remove the record. |
| `published brief … has no …` | A published brief is missing its picks file, Markdown, authoring record or registry entry. Add the missing part, or remove the others. |
| `is not a color token`, `which <Theme> does not define`, `text needs 4.5:1`, `an action's edge needs 3:1` | A brief names a color or pair the theme cannot back. Use a token, or a variable and pair the theme defines and keeps readable. |
| `as a fill with … text; text on it is`, `text beside …, whose text is` | Check 6: a sentence names a fill with text that belongs to another fill, family or step, or names the canvas text on a block without naming the canvas. Text on `--immersive-<fill>` is `--immersive-on-<fill>`, and text on `--immersive-canvas` is `--immersive-text`. A fill with no text named is only a warning in the draft's review report, never a CI failure. |
| `names "<name>", a preset source` | A source's site or domain name appears in a brief. Remove it. |
| `differs from fresh scripted output`, `sections must be, in order` | A scripted part no longer matches the theme, tokens or picks, or was edited by hand. Run `scripted-only`, and put lasting wording changes in `render.mjs`. |
| `its scripted sections cannot be checked`, `not rewritten` | The brief's prose cannot be found where the section map puts it, or a rewrite would drop hand-added text, such as an extra bullet, section or header paragraph, or a paragraph after the Brand Floor sentence; or its inputs have problems. Move or remove the text the message names, or fix the inputs listed first. |
| `takes the name of a fixed component` | An occasion component is named like one the brief renders itself. Rename it. |
| `is not an input the tool supplies`, `takes the output of`, `is not a band`, `must have an accentPlacement property`, `makes a cycle`, `has the placeholder` | A prompt library file names an input, band, order or placeholder the tool cannot fill. Use one the message lists, and name in `after` each entry whose output the entry takes. |
| `prose holds #…`, `prose gives …px`, `is not a Type Scale size`, `prose names a gradient`, `motion level does not allow`, `more than the … motion level's`, `a font other than` | Check 4: prose gives a value the theme does not. Name colors by variable or role, spacing by step and type by role, use px only as the brief's tables give it, keep motion within the layout's level, and name no typeface but the theme's. Fonts are found from a fixed list in `prose-checks.mjs`, so a font missing from it is not caught. |
| `has no published brief`, `missing; every Immersive Theme needs a theme text` | Check 11: an Immersive Theme has no theme text, or no published brief in the registry folder. Write its theme text, and publish at least its baseline brief. `check-only --skip-coverage` leaves this check out, for fixture trees that hold fewer themes than the theme data; CI never passes it. |
| `accent placement … is not one of`, `does not name its accent placement`, `nothing in this brief carries the accent` | Check 10: the record's accent placement is not one the brief allows, or the mood paragraph does not name it. Redraft the mood, or edit it to name the placement. |

The registry tests also run in `validate.mjs`, so a brief's registry entry must build like every other item.

## Branch: drafting from a page

To draft a layout preset from a public page, follow [drafting from a page](./theme-briefs/drafting-from-a-page.md). It covers what carries over, what stops a run and how measured values snap to steps.

## Branch: adding a theme

To add an Immersive Theme, follow [adding a theme](./theme-briefs/adding-a-theme.md). It covers the theme data, its theme text and baseline brief, and the briefs that change with it, in one PR.
