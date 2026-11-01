# Refero Styles design files: how each section is written

Answers [#74](https://github.com/finnonemo/neon/issues/74) for map [#73](https://github.com/finnonemo/neon/issues/73). The section survey (which sections exist, how often, and the table columns) is the `refero-design-md-schema` note. That note is uncommitted work in the `refero-design-research` worktree, not on `main`. This note covers how each part is *written*: the sentence pattern, the slots it fills, typical length, which values are measured and which are interpreted, and how measurements are normalized.

All examples below use invented placeholders such as *Harbor Fog*, *Signal Teal* and `#1f6f78`. None of them is a Refero brand's wording.

## Evidence

- **Corpus.** 1,342 Refero design files fetched from `styles.refero.design/style/<id>` on 2026-11-01. They are kept locally in `research/refero`, which is gitignored third-party content. By `manifest.csv` (parsed with `csv`, since one brand name contains a comma), 916 are light, 293 dark and 133 mixed.
- **Counts.** Throwaway Python scripts, run as `python3 -I <script> research/refero`, with regular expressions over each `##` section. Quick Start was excluded. The counts are heuristic: a regex classifier miscounts edge cases, so treat them as ±a few percent. The scripts were not committed.
- **Close reading.** Whole files across themes and brand types: a developer observability tool (light), an AI music app (dark), a dictation app (mixed), plus random samples of 6–25 per section.
- **Refero's public pages.** Fetched individually; there was no crawl, and `robots.txt` disallows Claude crawlers by name.
  - [Examples](https://styles.refero.design/ai-agents/design-md-examples)
  - [What is it](https://styles.refero.design/design-md/what-is-design-md)
  - [For AI agents](https://styles.refero.design/design-md/design-md-for-ai-agents)
  - [Resources](https://styles.refero.design/design-md/design-md-resources)
  - [Template](https://styles.refero.design/design-md/design-md-template)

  None of these pages explains how Refero generates its files. The template page gives authoring advice for a *user's* file, in five sections that differ from the generated format:
  - Define each typeface's role before its sizes.
  - Give each color its job, not just a hex.
  - Separate repeatable layout rules from one-off hero compositions.
  - Leave unknowns explicit.

  The examples page calls the files "Refero-generated style documents" that are not official brand guides.

### Measured versus interpreted

The only first-party statement on this is a three-sentence disclaimer, identical in all 1,342 files. It says three things:

1. Measurements are normalized, and roles and recommendations are interpreted.
2. The font summary lists are independent, so values are not paired by position.
3. HTML examples are reconstructions.

Everything else in this note about that split comes from consistency checks inside the files, described in [Measured versus interpreted](#measured-versus-interpreted-the-numbers).

## The generator's two voices

Every file mixes two kinds of text:

- **Template text.** Fixed table shapes, a fixed disclaimer, fixed token naming, and a small set of canned sentences that are evidently inserted by rule. Examples:
  - 720 color roles in 509 files end with the identical clause "Do not promote it to the primary CTA color".
  - 599 Quick Color References say the primary action has no distinct CTA color. Most of those files describe a button component elsewhere (468 of about 600), and 170 describe a non-ghost button with a chromatic fill hex.
  - 149 files say no distinct primary action color was observed.
  - 263 prompts end with the same filled-CTA sentence.
- **Model prose.** Taglines, the mood paragraph, roles, components, rules, Imagery, Layout and Similar Brands. Length and rhythm are very regular, but wording varies.

A skill that copies the format should reproduce the template text deterministically and write the prose against the measured values. It should not copy the canned fallbacks: in a sizable minority of files they contradict the file's own component descriptions.

## Header

### Tagline (`> ` line)

**Formula:** `<concrete subject> <preposition> <ground>` + optional ` — <gloss>` or a second sentence.

- The subject is an object, place or material, such as a lamp, studio, notebook or poster. The ground is a surface or setting, such as paper, slate, velvet, glass or gallery wall. In 71% of files the first clause contains a preposition such as *on*, *in*, *behind* or *over*.
  - Invented example: *Lantern light on harbor slate — one teal signal over quiet gray stone.*
- The first clause is 3–7 words in 95% of files (median 5). The whole line has a median of 16 words (range 3–49).
- **Shapes:**

  | Shape | Files | Notes |
  |---|---:|---|
  | Clause + em-dash gloss | 588 | The gloss names the canvas, the accent and the type voice. |
  | Bare fragment | 515 | A noun phrase with no gloss. |
  | Two sentences | 239 | The second sentence is often an imperative (*Build…*, *Pair…*) or starts with *A…*. |

- **Casing:** not normalized. Across all files, 509 taglines start lowercase and 606 have no final period.
- **Values:** almost never. Only 6 taglines contain a hex and 17 a px value. The tagline is fully interpreted.

### Theme line

The value is one of three: `light`, `dark` or `mixed`. It is an interpreted label, not a measurement:

- Mixed files have a light level-0 surface 69% of the time (90 of 130).
- Of 293 dark files, 4 still list a light level-0 surface.

### Mood paragraph

**Formula:** `<Brand> <framing verb> <metaphor>: <canvas, with hex> … <type voice: family, weight, display size range> … <accent rationing> … <geometry/components> … <closing sense of the whole>.`

- **Framing opener:**
  - *operates* (287), *is* (200), *reads like/as* (117), possessive *'s* (102), *uses* (91), *runs* (59), *presents*, *speaks*.
  - 271 paragraphs open without the brand as subject.
  - The em-dash opener (`<Brand> — <metaphor>`) is rare (19).
- **Slots, in order:**
  1. Canvas color, often with its hex in parentheses.
  2. Display family with weight or size range.
  3. Body family.
  4. The single accent and what it is rationed to. "Only … punctuation" is a recurring move.
  5. Corners, borders and density.
  6. A closing image.
- **Length:** one paragraph (1,332 of 1,342 files), median 122 words (p25 110, p75 132) and 5 sentences. The length is the same across light, dark and mixed.
- **Values:** a median of 0 hex values (p75 2) and 1 px. The hexes it cites are almost always palette colors (median off-palette 0%). The paragraph cites measured values selectively and rarely introduces new ones.

## Tokens — Colors

**Row formula:** `| <Modifier Noun> | \`#rrggbb\` | \`--color-<kebab-name>\` | <surface or job list>[ — <why it matters>] |`

- **Name:** two words in 59% of rows (*Harbor Fog*, *Signal Teal*) and one word in 40% (*Ink*, *Bone*). It is a material- or mood-flavored word plus a hue or role noun. The name is interpreted.
- **Token:** always `--color-` plus the kebab-cased name (13,278 of 13,280 rows). The name produces the token, so renaming a color renames its token.
- **Value:** the measured value. 97% of values are 6-digit lowercase hex.
  - 343 rows hold a full CSS gradient as the value. The gradient also gets its own `--gradient-*` variable in Quick Start.
  - Rare malformations: 27 uppercase, 14 wrong-length and 7 eight-digit hex values. Six gradients contain a truncated hex. The output is not validated.
- **Role:** a median of 14 words (p25 9, p75 19).
  - It opens with an emphasis or job word: *Primary* (1,525), *Page* (1,027), *Secondary*, *Muted*, *Card*, *Hairline*, *Tertiary*, *Decorative*.
  - It then lists concrete places: canvas, card fields, 1px dividers, nav labels.
  - 47% add ` — <rationale>`, for example *— the only saturated color, so it reads as the action*.
  - Roles do not end with a period (96%).
- **Canned roles:** a hue word plus a stock job phrase, followed by the fixed "Do not promote it to the primary CTA color" clause. These appear in 509 files. Examples of the stock job phrases:
  - *supporting accent for decorative details and low-frequency emphasis* (193 rows)
  - *neutral for secondary UI, dividers, and muted labels*
  - *supporting surface for subtle backgrounds and section separation*
- **Order:** the first row is the canvas in 56% of files. Otherwise the brand's action color often comes first. Order is not normalized.
- **Count:** 2–31 rows, median 9.

## Tokens — Typography

### Family block

```md
### <Family> — <role sentence(s)> · `--font-<kebab-family>`
- **Substitute:** <1–3 fallbacks>
- **Weights:** <ascending list>
- **Sizes:** <ascending px list>
- **Line height:** <ratio list | annotated ranges>
- **Letter spacing:** <value at size; …>
- **OpenType features:** <tags> (21% of blocks)
- **Role:** <role sentence(s)>
```

- **The heading repeats the Role field verbatim** in 3,587 of 3,596 blocks. The role sentence runs a median of 33 words (p25 19, p75 48). It reads like this: *what the family sets → the weight split → the tracking or leading move that makes it distinctive → where it never appears*.
- **Substitute:** interpreted.
  - 1 name: 655 blocks; 2 names: 817; 3 or more: 1,426. The list is written `A, B, or C`.
  - 698 blocks omit the field, usually for system or fallback stacks.
- **Measured lists:** Weights, Sizes and Line height. They are deduplicated and sorted, and kept independent of each other, which is what the disclaimer's "not paired by position" sentence warns about.
  - Line heights are unitless ratios with 2 decimals in the family block, as in `1.13, 1.25, 1.50`.
  - About 1,240 blocks write annotated ranges instead, as in `1.20–1.78 (body), 0.87–1.14 (display)`.
- **Letter spacing:** em, px or both.
  - Annotations are mixed and written by the model, such as `-0.025em at 48px+`, `normal at body` or `-1.2px at 48px`.
  - 515 blocks omit the field.

### Type Scale table

**Row formula:** `| <slug> | <family or —> | <weight or —> | <N>px | <ratio> | <±N.NN>px or — | \`--text-<slug>\` |`

- **Slug vocabulary:** a small fixed set. In descending frequency: *display, heading, caption, body, subheading, heading-sm, heading-lg, body-sm, body-lg, display-xl, display-lg*, with occasional site-specific slugs such as *nav* or *eyebrow*.
- **Family and weight:** `—` in 95% of rows (8,748 of 9,198). The scale is a sizes, leading and tracking ladder, not a role-to-family mapping. A minority variant (450 rows) fills in family and weight.
- **Line height:** always a unitless ratio, with trailing zeros dropped: `1.5`, `1.13`, `1`.
- **Letter spacing:** always px, or `—` (27%).
  - 92% of nonzero values equal a clean 3-decimal em times the size. Tracking is captured in em, then converted to px per row, as in `-0.025em × 48px = -1.2px`.
  - This is why the family block often says em while the table says px.

## Tokens — Spacing & Shapes

This section is almost entirely measured, written as key–value lines and tables, with no prose.

- **Base unit:** 4px (721 files), 8px (267) or 6px (55); omitted in 299.
  - Where a base unit is given, every spacing step is a multiple of it in 904 of 1,040 files.
  - In the rest, the scale keeps measured off-grid steps such as 44px, 60px or 104px. Values are not snapped to the grid.
- **Density:** one word, *comfortable*, *compact* or *spacious* (910 / 303 / 129). It is interpreted and roughly the same mix in every theme.
- **Spacing Scale:** the step name equals its px value in all 15,004 rows (`| 24 | 24px | --spacing-24 |`), so there is no t-shirt naming.
- **Border Radius:** one row per element, using a semantic name from a short list: *buttons* (1,307), *cards* (1,264), *inputs* (702), *tags*, *images*, *badges*, *pills*, *nav*. Values are raw measured px. Full-round values are kept as found:
  - `9999px` (664), `100px` (377), `999px` (98), `1000px` (35).
  - 3 files keep the browser's clamped computed value `16777200px`.
- **Shadows:** measured CSS. Values longer than about 60 characters are cut with `...` in the table (282 files) but kept whole in Quick Start.
- **Layout:** four fixed keys.
  - Element gap: 1,335 files; Card padding: 1,310; Section gap: 1,308; Page max-width: 1,088.
  - Each is a single px value, presumably the dominant measurement.

## Components

**Entry formula:**

```md
### <Descriptive Name> (<variant or label>)
**Role:** <short job phrase>

<property list> . <contents/structure sentence> . <state or usage note> . [<interpretive closer>]
```

- **Name:** the visual treatment plus the element, as in *Ghost Outline Button*, *Pastel Showcase Card* or *Floating Nav Pill*. Names often reuse a color name from the palette.
- **Role:** median 6 words, a noun phrase of job and context, as in *Secondary action on dark bands*.
- **Paragraph:** median 34 words (p25 28, p75 42), 2–4 sentences.
  - Three shapes:
    - **Noun-phrase property list** (94%), for example *Harbor Fog background, 1px Signal Teal border, 8px radius, 12px 20px padding, Body Sans 14px/500 Ink text.*
    - **Imperative recipe** (5%), opening *Use/Fill/Set/Place…*.
    - **Labeled fields** (2%), as in `Fill: … Text: … Border: …`.
  - The usual opening is the fill: *White*, *Background*, *Transparent*, *Full-width*, *Full-bleed*.
- **Values:** a median of 1 hex and 3 px per paragraph.
  - 37% name a palette color by its table name; 26% give both the name and a hex.
  - 10% describe hover, focus or pressed states.
  - 19% end on an interpretive closer: *the only…*, *never…*, *feels…*, *deliberately…*.
- **Count:** 4–17 entries, median 12. Buttons, cards, nav, pills, hero, links, badges and logo dominate.

The disclaimer's "HTML examples are reconstructions" covers this section. Each entry is a recipe the model reconstructed from screenshots and measurements, not an extracted component.

## Do's and Don'ts

- **Shape:** two lists of 7 bullets each (median, both lists; range 0–10). One sentence per bullet, median 19 words.
- **Do formula:** `<Imperative verb> <element/role> <exact value(s)> [— or ; <reason or scope>]`.
  - Verbs: *Use* (38%), *Set*, *Apply*, *Keep*, *Let*, *Reserve*, *Maintain*, *Pair*.
  - 84% carry a value (hex, px or a weight), and 35% a hex.
  - 64% have a reason or scope tail.
  - Invented example: *Reserve Signal Teal #1f6f78 for filled actions and links; never as a section fill.*
- **Don't formula:** `<Negation> <tempting mistake> — <why it breaks the system>`.
  - Negation: *Do not* (49%), *Don't* (38%), *Never <verb>* (13%).
  - Each file sticks to one negation form (1,289 of 1,342 use a single form).
  - Only 48% carry a value, but 89% carry the reason tail. Don'ts are about principle; Dos are about exact values.
- **Pairing:** Don'ts often mirror Dos, as in *use 24px card corners* / *do not use 8px corners on cards*.
- **Values:** 77% of files cite no off-palette hex in this section (309 of 1,342 cite at least one).

## Surfaces

**Row formula:** `| <0…n> | <Role-ish Name> | \`#hex\` | <purpose, ~9 words> |`

- **Rows:** a median of 4 (1–9). Level 0 is the canvas, page or base in 99% of files.
- **Values:** the median file takes 100% of its surface values from the color table. Names are often re-labeled by role, so *Harbor Fog* in the color table may become *Canvas* here.
- **Order:**
  - Dark files step **lighter** as the level rises (226 of 276).
  - Light files split: 456 step darker and 348 lighter, for example a gray canvas with white cards.
  - Levels are numbered 0, 1, 2… without gaps in 74% of files. The rest skip or repeat numbers.
- **Measured versus interpreted:** the values are measured; the level order and purposes are interpreted.

## Elevation

Two forms, chosen by whether the page has shadows (89 files omit the section):

- **Recipe bullets** (569 files): `- **<Component or use>:** \`<full CSS box-shadow>\``. The value is the measured shadow, keyed to the component that carries it.
- **Flat statement prose** (684 files): a median of 51 words.
  - It says the system is flat or shadowless (about 80%).
  - It names what does the separating work instead: borders, surface steps, tonal contrast.
  - It ends with an instruction not to add shadows.
- **Duplication:** 1 of 11 files with an Elevation Philosophy section repeats Elevation verbatim.

## Imagery

**Formula:** a single paragraph (always), median 96 words and 5 sentences.

`<What kind of imagery leads> : <how it is framed (crop, radius, bleed, container)> . <what it depicts and its color treatment> . <the non-photo graphics (illustration, 3D, diagrams, logos)> . <icon style (stroke or fill, weight, color)> . <density verdict + what it should never look like>.`

- **Opening:** usually *Imagery is…* (332), *Photography is…* (201), *The visual…*, or a negative opener (*No photography, …*).
- **Coverage:** almost always photography (98% mention it), then illustration (78%) and icons (71%). Screenshots, 3D and gradients are covered when present.
- **Closer:** often *text-dominant* or *image-led*, followed by a *not stock/SaaS* contrast.
- **Values:** almost none. The median paragraph has 0 hex and 0 px; when present they are radii or icon stroke widths. The section is fully interpreted from screenshots.
- **Theme:** the same length and shape across light, dark and mixed.

## Layout

**Formula:** a single paragraph, median 116 words and 7 sentences.

`<page model: max-width + centered/full-bleed> . <hero pattern> . <section sequence and alternation> . <content arrangements (columns, grids, split text/visual)> . <nav pattern> . <footer> . <vertical rhythm with px gaps / density>.`

- **Opening:** *The page…*, *Max-width 1200px…*, *Full-bleed…*, *Centered max-width…*, *Page model:…*.
- **Coverage:** section (97%), nav (95%), hero (92%), columns (89%), centered (89%), max-width (87%), grid (81%), rhythm (72%). The footer is named in only 25%.
- **Values:** a median of 3 px values, mostly the max-width and section or card gaps from the measured Layout block. 69% of files use `~` approximations somewhere in Components or Layout, as in *~1200px* or *~72–140px*. These are measured values restated loosely.

## Agent Prompt Guide

### Quick Color Reference

- **Role-keyed** (1,141 files): `- <role>: #hex (<Name>)`. The keys come from a fixed vocabulary:
  - *primary action* (1,158), *background* (924), *border* (908), *text* (880), *accent* (697).
  - Then *muted text*, *card surface*, *surface*, *canvas* and variants such as *text (primary)*.
- **Name-keyed replay** (153 files): every color table row repeated as `- <Name>: #hex — <role>`.
- **The primary action slot:**
  - It is filled with the action hex plus a parenthetical, as in *(filled action)*.
  - Or it is filled with the canned "no distinct CTA color" fallback (599 files), even where Components describes a non-ghost button with a chromatic fill (170 files).
  - 149 files add a sentence advising the extracted neutral button treatments.
- **Promotion:** 244 files promote this block to its own `##` heading. Neither QCR format is tied to promotion.

### Example prompts

- **Count:** 5 prompts in 70% of files; 3, 4 or 6 in 336 more (25%); 0–2 in 66, some of which may be parser misses.
- **Two shapes:**
  - **Verb-led** (42%): `Create|Build a <component>: <property list>. <inner structure>. <state>.` *Create* outnumbers *Build* about 3:1.
  - **Title-led** (57%): `**<Component Name>**: <property list>…`.
- **Length:** in the verb-led prompts measured (2,384), a median of 38 words (p25 29, p75 50), with 2 hex and 4 px. Prompts are the densest prose in the file: every visual property is stated as a literal value, and color names are rarely used without a hex.
- **Content:** 28% embed placeholder UI copy in quotes, as in a button label or a heading line.
- **Values:** prompts cite palette hexes almost exclusively (median off-palette 0%). Line height is sometimes written as a px pair, `16px/24px` (99 files), computed from the ratio.
- **Canned prompt:** a filled-CTA prompt ending with a fixed sentence about the main CTA, in 263 files.
- **One leaked self-correction** was found mid-prompt. It is rare but shows the prose is unedited model output.

## Similar Brands

**Formula:** `- **<Brand>[ (<qualifier>)]** — <Same|Similar|Shares> <2–3 shared traits>`

- **Count:** 3–5 bullets, median 5.
- **Gloss:** a median of 18 words. It opens with *Same…* in 46% of bullets, then *Similar*, *Shares*, *Identical*, *Both*, or a trait adjective.
- **Qualifier:** 10% of bullets add a parenthetical scoping the comparison, such as a product area or *dark mode*.
- **Values:** 8% cite a hex or px value.
- **Measured versus interpreted:** entirely interpreted. Comparison brands are drawn from well-known web brands, and nothing in a file says how they were chosen.

## Optional sections

They follow a heading formula `<Topic> <System|Philosophy|Discipline|Rules|Logic|Voice|Signature>`. The topic is gradient, typography, elevation, radius, color, motion and so on. The body is a 2–5 sentence paragraph that restates token values as a rule set and closes with a prohibition. *Gradient System* (105 files) is the only common one; it describes the stops, where the gradient may appear and where it must not.

## Measured versus interpreted: the numbers

| Value | Source | Normalization observed |
|---|---|---|
| Color values | measured | lowercase 6-digit hex; gradients kept as full CSS; not validated (rare bad hex) |
| Color names, roles, order | interpreted | name → token by kebab-case |
| Font family, weights, sizes, line heights | measured | deduplicated, ascending, independent lists; line height as a unitless ratio |
| Letter spacing | measured | em in family blocks, converted to px per Type Scale row (em × size, 2 decimals) |
| Substitutes, family roles, type slugs | interpreted | slugs from a fixed vocabulary |
| Spacing steps, radii, shadows, layout widths and gaps | measured | px as found; not snapped to base unit; full-round radii unnormalized; long shadows truncated in tables |
| Base unit, density | inferred | base unit from step divisibility (4/8/6); density one of three words |
| Theme label | interpreted | three values; does not always match the level-0 surface |
| Component recipes, prompts | reconstructed | reuse measured values, but drift (below) |
| Mood, tagline, Imagery, Layout, Do/Don't reasons, Similar Brands | interpreted | fixed lengths and slot orders |

How closely prose reuses measured values:

- **Hex:** prose rarely invents colors.
  - Median off-palette rate is 0% in every prose section.
  - Files with at least one off-palette hex: Components 333, Do/Don't 309, Agent Prompt Guide 203, Imagery 20, Layout 8.
- **px:** prose drifts.
  - In a median file, 20% of the distinct px values in Components (p75 29%) and 19% in prompts appear in none of the measured spacing, radius or type lists. Typical cases are component heights, icon sizes and odd paddings.
  - When prose pairs a family with a size, 36% of pairs (3,751 of 10,311) cite a size missing from that family's measured Sizes list. For example, a serif measured only at 24px is described as the 72–140px display face.
  - The prose is therefore not a faithful readout of the token tables.

## Implications for a Neon skill (#73)

These are findings, not decisions; the map decides.

- **Treat the format as two layers.**
  - **Template layer, from measurement.** Header disclaimer, table shapes, token naming, Type Scale conversion and Quick Start. Generate this layer by script.
  - **Prose layer, written with the formulas above.** Tagline, mood, roles, components, rules, Imagery, Layout and prompts.
- **Constrain the prose to measured values.** Two checks would remove Refero's main weaknesses:
  - Every hex and px in prose must exist in a token table or be marked approximate.
  - A family may only be paired with its measured sizes.
- **Don't import the canned fallbacks.** This covers the "Do not promote" clause, "no distinct CTA color" and the filled-CTA prompt. Detect the action color from the components instead.
- **Normalize what Refero leaves raw.**
  - Clamp full-round radii to one value.
  - Snap capitalization of the tagline.
  - Put the canvas first in the color table.
  - Validate hex.
  - Don't truncate shadows.

## Evidence limits

- **Process.** The generation process isn't publicly documented. The measured/interpreted split rests on the in-file disclaimer plus the consistency checks above, not on Refero's code.
- **Displayed text only.** The corpus is the text displayed on each style page. It was not compared with the Download button output.
- **Counts.** All counts come from regex heuristics over one fetch date. Classifier edges, such as the component paragraph shapes, the prompt shapes and the "interpretive closer", could move by a few percent. Version drift in the generator, for example the name-keyed QCR or family-filled Type Scale variants, was observed but not dated.
- **Public pages.** Only five public pages returned content (two `refero.design` URLs rendered empty), because `robots.txt` disallows Claude crawlers.
