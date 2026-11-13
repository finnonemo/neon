# Skill and theming ideas for the Neon skills

13 November 2026. Research for one question: how can `neon-create`, `neon-redesign`, `neon-review` and `neon-audit` each do their job reliably, leave the agent free to design, and produce screens that look like Uber's product UI through shadcn theming?

Every external claim cites a file at a pinned commit. Neon citations are `file:line` in this worktree as it stood on this date, at commit `8e7d972` ("State the design intent behind the skills' rules"), which landed while this note was being written.

Not verified, so not used: `base.uber.com` (the page is rendered by JavaScript; a fetch returned only its title), shadcn's `mcp.mdx`, `registry/mcp.mdx`, `llms.txt` and `apps/v4/AGENTS.md` (they exist in the repo but were not read), the rule file `command.md` that Vercel's skill downloads, and the separate `neon-showcase` checkout.

## Contents

1. Sources
   1. Anthropic: skill authoring docs, `skill-creator`, `frontend-design`
   2. shadcn/ui: theming docs, registry schema, its own skill
   3. Uber Base Web: theme tokens
   4. Other design-skill repos: impeccable, superpowers, Vercel, tweakcn
2. Neon against Uber Base, measured
3. What Neon already does
4. Recommendations, ranked

## 1. Sources

### 1.1 Anthropic

**Skill authoring best practices** — <https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices> (fetched 13 November 2026; a docs page, so no line numbers).

- "Set appropriate degrees of freedom": match how specific an instruction is to how fragile the task is. Text instructions where several approaches are valid, a parameterised script where a pattern is preferred, an exact script where one wrong step breaks things. The page's picture is a narrow bridge (one safe path, give exact steps) against an open field (many paths, give a direction).
- "Keep references one level deep from SKILL.md": a file reached through another reference may be read only in part.
- A reference file longer than 100 lines gets a table of contents at its top, so a partial read still shows what the file holds.
- "Build evaluations first": run the task without the skill, record what fails, then write the least instruction that fixes it. At least three scenarios.
- "Provide a default (with escape hatch)" instead of a list of options.
- "Prefer scripts for deterministic operations", and a "run validator, fix errors, repeat" loop.
- A description is written in the third person, says what the skill does and when to use it, and is at most 1,024 characters; the body stays under 500 lines.

**`skill-creator`** — `anthropics/skills` at `2c5958e`, base URL <https://github.com/anthropics/skills/blob/2c5958ecac7cee2b583967a2c4981d0f4a75c579/skills/skill-creator/SKILL.md> (append `#L<n>`).

- L67: the description is the main trigger; models under-trigger, so write it "a little bit pushy".
- L86-96: three loading levels (metadata, SKILL.md body, bundled resources); SKILL.md under 500 lines.
- L139: explain why a thing matters instead of writing "heavy-handed musty MUSTs"; use theory of mind and keep instructions general, not narrow.
- L169-186: each test case runs twice, with the skill and without it; when improving an existing skill, the old version is the baseline.
- L234: an analyst pass looks for assertions that pass in both arms. They do not discriminate and say nothing about the skill.
- L298-302: generalise from feedback, keep the prompt lean by reading the transcripts for what the model wasted time on, explain the why.
- L327: blind comparison of two outputs by a judge that does not know which is which.

**`frontend-design`** — same commit, <https://github.com/anthropics/skills/blob/2c5958ecac7cee2b583967a2c4981d0f4a75c579/skills/frontend-design/SKILL.md>.

- L9: frames the agent as a design lead who makes deliberate choices.
- L11-13: ground the design in the subject matter of the brief.
- L38-45: a calibration list of five looks a model reaches for by default. L45 is the important sentence: the traits are "defaults rather than choices"; where the brief pins a direction, follow it exactly; where it leaves an axis free, do not spend that freedom on a default. Nothing in the list is banned.
- L47-53: two passes. First a compact plan (four to six named colours, type roles, a layout concept as an ASCII wireframe, principles), then a review of the plan against the brief, and only then the build.
- L59: "Spend your boldness in one place"; a quality floor met "without announcing it"; critique your own screenshots; "remove one accessory".
- L61-71: writing is part of design. A button names its action; an error says what happened and what to do.

### 1.2 shadcn/ui

`shadcn-ui/ui` at `dd41d19`, base URL <https://github.com/shadcn-ui/ui/blob/dd41d19e2f80ff6891951f7ced74c2c9a650b065/> (append the path and `#L<n>`).

**Theming docs** — `apps/v4/content/docs/(root)/theming.mdx`, `tailwind-v4.mdx`.

- `theming.mdx` L14: components use semantic tokens, so a theme changes without rewriting classes. L39-56: every surface token has a `-foreground` partner. L93-116: the radius scale is derived from one `--radius` (default `0.625rem`, L205). L118-130: a new token is added as a pair and registered for Tailwind.
- The default theme (L205-225) declares colours and `--radius` only. It declares no shadow variable; a search of the file for "shadow" finds nothing.
- `tailwind-v4.mdx` L11: variables move under `@theme inline`; L14: every primitive carries a `data-slot`.

**Registry schema** — `apps/v4/content/docs/registry/registry-item-json.mdx`.

- L108: `registry:base` is "for entire design systems". L117-118: `registry:style` and `registry:theme`. L314-316: the `tailwind` key is deprecated in favour of `cssVars.theme`. L347 `cssVars`, L368 `css`, L427 `font`.

**shadcn's own skill** — `skills/shadcn/`.

- `SKILL.md` L16-18: the skill injects live project facts on load by running `npx shadcn@latest info --json`, so the agent starts from the project's actual base, style and installed components. `apps/v4/content/docs/(root)/skills.mdx` L38 confirms it runs on every use.
- `SKILL.md` L22-27, L29 onward: four principles, then rules that each link to a rule file holding an Incorrect and a Correct example. L35: `className` is for layout, not styling. L39: no hand-written `dark:`.
- `design-system.md` is a workflow for turning a written design spec (a `DESIGN.md`) into a shadcn theme. The parts that transfer:
  - L60-71: a "style" decides geometry that CSS variables cannot reach (control padding, density, how rounded and raised). The `luma` row reads "Pill buttons, soft layered shadows".
  - L104: read the spec's "Do's and Don'ts" first; they override defaults.
  - L106-121: before editing, extract a working table (canvas and ink, action colour and states, lines, focus, type scale, radius, elevation, control heights, hard rules).
  - L127: "Edit only `tailwindCssFile`".
  - L163-195, radius: a spec's radius scale "rarely fits the `--radius` multipliers. Pin each step in `@theme inline` instead", after grepping which `rounded-*` class each component uses (L192).
  - L197-207, elevation: "Override Tailwind's shadow scale in `@theme`, not `@theme inline`"; "Set `--shadow-xs` to `0 0 #0000` when the system is hairline-only, because inputs and outline buttons use it."
  - L232-234, type: custom type roles become `type-*` utilities, not `--text-*` keys, "because `cn()` treats unknown `text-*` classes as colors".
  - L289-304: component recipes map onto existing `cva` variant names; add a variant only for a distinct recipe.
  - L306-322: "Control heights move together": when the button height changes, the field controls change with it, with a table of the files that hold the height.
  - L326: "Turn each 'Don't' into a check before you finish".
  - L366-375, verify: typecheck, no console errors, `scrollY === 0` on load, no horizontal overflow at 375px and 1280px, screenshots compared with the spec.
  - L379-386, report: contrast pairs under 4.5:1, every component file edited and why, every deliberate deviation.
- `design-system-page.md`: L23 "Roles, not palettes", each colour pair shown with its measured contrast (L61-75); L25 and L143 pin hover, focus and pressed states side by side with a `data-preview` attribute so a screenshot can show them; L214 do and don't examples are rendered, not described.

### 1.3 Uber Base Web

`uber/baseweb` at `ed21081`, base URL <https://github.com/uber/baseweb/blob/ed21081e33f7db2770922b4e04d16dcf5bbdfa85/> (append the path and `#L<n>`). This is Base's open-source React library. The design documentation at `base.uber.com` could not be fetched, so nothing here comes from it.

- **Four token layers.** Primitives (`src/tokens/color-primitive-tokens.ts`), foundation (`src/themes/light-theme/color-foundation-tokens.ts`), semantic (`color-semantic-tokens.ts`), component (`color-component-tokens.ts`). A component token points at a semantic token, never at a hex.
- **Black and white are the two primaries.** `color-foundation-tokens.ts` L13-14: `primaryA` is black, `primaryB` is white. L25: the accent is `blue600` (`#276EF1`, `color-primitive-tokens.ts` L126).
- **Semantic colours.** `color-semantic-tokens.ts` L25-29: page white, secondary surface `gray50` (`#F3F3F3`), tertiary `gray100`, inverse black. L32-37: text black, secondary `gray800` (`#4B4B4B`), tertiary `gray700`. L40-45: opaque border `gray50`, transparent border black at 0.08, selected border black.
- **Buttons.** `color-component-tokens.ts` L32-35: the primary button is black with white text, hover `gray900`, pressed `gray800`. L44-47: secondary is `gray50`. L56-59: tertiary is transparent.
- **Inputs are filled.** `color-component-tokens.ts` L222-227: input fill and input border are both `gray50`, so the field has no visible outline at rest; the fill turns white when active.
- **Radius is small, and pill is opt-in.** `src/themes/shared/borders.ts` L42-46: radii of 2, 4, 8, 12 and 16px. L51: button 8px. L56: input 8px. L60: surfaces (card, modal, toast, date picker) 0px. L62: tag 24px. `src/button/constants.ts` L20-28 lists `shape` values; `src/button/styled-components.ts` L308-315 gives `pill` and `rounded` a 999px radius and leaves the default at 8px.
- **Button heights.** `src/button/styled-components.ts` L887-908: 28, 36, 48 and 56px for xSmall, small, default and large.
- **Borders are faint black.** `borders.ts` L12-41: six border steps, 1px solid black at 0.04 to 0.24 opacity.
- **Type.** `src/themes/shared/typography.ts`: paragraphs 12/14/16/18px at normal weight (L16-56); labels the same sizes at weight 500; headings 20 to 40px at weight 700 (L64-98); display 36 to 96px at weight 700 (L100-123).
- **Spacing and grid.** `src/themes/shared/sizing.ts` L10-31: a 4px-based scale (2, 4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 96…). `grid.ts`: 4, 8 or 12 columns, 16 or 36px gutters, 1280px maximum width.
- **Shadows.** `lighting.ts` L10-13: four shadows, black at 0.16, from `0 1px 4px` to `0 8px 24px`.

### 1.4 Other design-skill repos

**impeccable** — `pbakaus/impeccable` at `b4bff16`, base URL <https://github.com/pbakaus/impeccable/blob/b4bff1626c344067788c2679f048a20057c7cc5a/.claude/skills/impeccable/>.

- `SKILL.md` L14: "Scale ambition to the surface's mode". L34-41: four modes (Persuade, Operate, Read, Experience), chosen from the surface, not the product. L27: "The brief wins". L28: "Refinement preserves; redesign replaces".
- `reference/craft-floor.md` L3: the floor is loaded after the direction is settled, and "a pinned brief or the committed visual world overrides anything here except a line marked as a ban". L21: its Refuse list holds "the category's defaults, not bans: the brief's own words can earn any of them". L44: "The floor holds the mechanics; it never picks the direction".
- `reference/critique.md` L5-16: the design review and the automated detector run as two isolated passes, and the review must finish first, because "detector output is deterministic, but it still anchors judgment". L46-58: the review asks about design specificity, "could an unrelated product use it unchanged?".
- `reference/shape.md` L35: when interviewing for a brief, "never ask for CSS values or canned aesthetic lanes".

**superpowers** — `obra/superpowers` at `22f0b46`, <https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-skills/SKILL.md>.

- L14: test-driven skills. A scenario fails without the skill, the skill is written, the scenario passes, loopholes are closed.
- L95-98: a description says only when to use the skill and "never summarizes the skill's workflow", because an agent that reads a workflow summary follows the summary and skips the skill.
- L248-262, "Match the Form to the Failure": a discipline failure gets a prohibition; a wrong-shaped output gets a positive recipe; an omitted element gets a required slot in a template; conditional behaviour gets a condition on something observable.
- L287: no content for hypothetical cases. L303: "Variance is a metric".

**Vercel web-design-guidelines** — `vercel-labs/agent-skills` at `1a2c79d`, <https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/web-design-guidelines/SKILL.md> (39 lines). A thin review skill: it downloads the current rules from a second repository before each review and reports terse `file:line` findings. The transferable idea is the split, a short stable skill and a rule list that changes without a skill release. The rule file itself was not read.

**tweakcn** — `jnsahaj/tweakcn` at `a3b47b3`, <https://github.com/jnsahaj/tweakcn/blob/a3b47b37cba97dd637de517aab52c45ec0f83456/types/theme.ts#L5-L73>. A whole shadcn look as one flat schema: the colour slots, three font families, `radius`, six shadow parameters (`shadow-color`, `-opacity`, `-blur`, `-spread`, `-offset-x`, `-offset-y`), `letter-spacing` and an optional `spacing`, once for light and once for dark. The idea: shadow, tracking and spacing are theme knobs beside colour and radius.

## 2. Neon against Uber Base, measured

Produced by `node research/neon-vs-base-tokens.mjs`, run from the repository root. The script reads Neon's values from this checkout; the Base values are fixed in the script with their source lines at the commit above.

| Role | Neon value | Neon source | Base Web value | Base Web source |
| --- | --- | --- | --- | --- |
| Text (ink) | `rgba(0, 0, 0, 0.851)` | `theme/css/theme.css:83` | #000000 | `color-semantic-tokens.ts:32` |
| Secondary text | `rgba(0, 0, 0, 0.651)` | `theme/css/theme.css:84` | #4B4B4B | `color-semantic-tokens.ts:33` |
| Page | `rgb(255, 255, 255)` | `theme/css/theme.css:91` | #FFFFFF | `color-semantic-tokens.ts:25` |
| Quiet surface | `rgb(242, 242, 242)` | `theme/css/theme.css:92` | #F3F3F3 | `color-semantic-tokens.ts:26` |
| Primary action fill | `rgb(1, 23, 43)` (navy) | `theme/css/theme.css:97` | #000000 | `color-component-tokens.ts:32` |
| Secondary action fill | `rgb(242, 242, 242)` | `theme/css/theme.css:99` | #F3F3F3 | `color-component-tokens.ts:44` |
| Hairline | `rgba(0, 0, 0, 0.122)` | `theme/css/theme.css:109` | black at 0.08 | `color-semantic-tokens.ts:41` |
| Focus / accent | `rgb(105, 104, 239)` (indigo) | `theme/css/theme.css:112` | #276EF1 (blue) | `color-foundation-tokens.ts:25` |
| Field fill | `rgba(1, 23, 43, 0.102)` | `theme/css/theme.css:151` | #F3F3F3, border the same grey | `color-component-tokens.ts:222-224` |
| Button radius | `rounded-full` (pill) | `registry/ui/button.tsx:23` | 8px; 999px only for `shape` pill | `borders.ts:51`, `button/styled-components.ts:308-315` |
| Button heights | 56 / 48 / 36 / 28px (`h-14`, `h-12`, `h-9`, `h-7`) | `registry/ui/button.tsx:43-46` | 56 / 48 / 36 / 28px | `button/styled-components.ts:887-908` |
| Input | `h-14 … rounded-md bg-field` (56px, 8px radius, filled) | `registry/ui/input.tsx:19` | 8px radius, filled | `borders.ts:56` |
| Card | 24px radius with a border | `registry/ui/card.tsx:27`, `theme/css/theme.css:251` | 0px surface radius | `borders.ts:60` |
| Largest title | 28px / 40px / weight 400 | `theme/css/theme.css:189, 217, 203` | Heading XXLarge 40 / 52 / 700; Large 32 / 40 / 700 | `typography.ts:64-98` |
| Body | 17px / 24px / 400 | `theme/css/theme.css:194, 222, 208` | 16px / 24px / normal | `typography.ts:16-56` |
| Label | 15px / 600 | `theme/css/theme.css:195, 209` | 16px / 500 | `typography.ts:46-50` |

What the table shows:

- **Already the same in kind:** white page, one grey secondary surface a single step from Base's, black-alpha hairlines, filled inputs with no outline at rest, 8px inputs, and the same four button heights to the pixel.
- **Different:** the primary action and ink are navy and black-at-85%, where Base is pure black; the focus colour is indigo, where Base's accent is blue; cards are 24px with a border, where Base surfaces are square; titles are weight 400 and stop at 28px, where Base headings are weight 700 and reach 40px.
- **Pill buttons are a choice inside Base, not its default.** Base's default button is 8px. Neon ships pill on every button.

Which of those Neon may change is not a skill question. Colours come from Core's Theme tokens (`AGENTS.md:11`; [ADR 0009](../docs/adr/0009-neon-matches-core-not-cds.md)). Type sizes and line heights come from Core's text styles; `core/text-styles.json` holds `size` and `lineHeight` only, and `AGENTS.md:11` says font weight, space and radius in `theme/css/theme.css` are "maintained separately". So title weight and card radius are Neon's own values, and the navy is Core's.

## 3. What Neon already does

Checked in this worktree at `8e7d972`, so the recommendations below are gaps and not repeats.

- **States the ideas behind the rules.** `skills/INSTRUCTION.md:14-25`: six ideas (interface is ink, hierarchy by size and position, depth as a step of surface, few shapes, space before lines before boxes, one next step), with "design from the idea rather than from the nearest rule" (L16). This is `skill-creator` L139, explain the why.
- **Separates fixed from free.** `skills/INSTRUCTION.md:27-36`: a "Fixed, and yours to design" table; L36 says the patterns "are defaults that solved earlier screens, not templates". L90: task-based choices are "decision aids, not mandatory screen templates".
- **Plans before building.** `skills/neon-create/SKILL.md:23`: a three or four line design thesis before new UI, checked against the screenshots later. For an open immersive direction, two or three static directions first.
- **Looks at its own render.** `skills/neon-redesign/references/verification.md:15-33`: screenshot at 375px and 1440px, a written critique, fix the top three, at most three rounds, no numeric score, and never a critique from source (L33).
- **Scripts for the deterministic parts.** Browser probe (`verification.md:9`), source lint (`verification.md:13`), `scripts/contrast.mjs`, `scripts/token-lookup.mjs`, `scripts/install.mjs` (`skills/neon-create/references/neon-base.md:10`).
- **Low freedom where the task is fragile, with the reason given.** `neon-base.md:42` (no `dark:`, because roles switch with `data-theme`), `neon-base.md:43` (Neon's `cn`, because the bare one drops type roles; the same hazard shadcn names at `design-system.md` L234).
- **Evidence-limited review.** `skills/neon-review/SKILL.md:24-28` and `references/review-checks.md:7-12`: what a screenshot, source or live UI can and cannot support. `review-checks.md:28`: a look finding names the idea it rests on, and an unlisted composition is not a finding.
- **Scope before style.** `skills/neon-redesign/SKILL.md` and `references/style-migration.md:17` (tier scope), with shadcn roles mapped by meaning (`style-migration.md:203-262`) and, after the values, a look at the stock shadcn habits the variables do not reach (`style-migration.md:278-289`).
- **Baseline against revised, and blind.** `evals/skills/README.md:3` runs each scenario against the baseline and then the revision; `evals/skills/records/output-quality-blind.md` compares two packages with three samples each and a judge who sees neutral names (L23); `evals/skills/README.md:90` has `reference-reads.mjs`, which lists the skill files a run read and how much of each.
- **Descriptions.** All four are "Use when…" triggers of 254 to 516 characters that name the neighbouring skill and do not summarise a workflow (`skills/neon-*/SKILL.md:3`).
- **Short entrypoints.** The four SKILL.md files are 34 to 44 lines, with conditional references (`skills/neon-create/SKILL.md:28-39`).
- **Much of the Uber shape.** Pill buttons at Base's four heights, filled inputs, one grey surface, shadows only on floating layers (`skills/neon-audit/references/functional-patterns.md:22`), list rows before cards (`functional-patterns.md:15-17`), one primary action (`functional-patterns.md:9`).

## 4. Recommendations, ranked

Ranked by expected effect on the three goals. Each names the file to change. "Constraint risk" says whether the change narrows what the agent may design.

### 1. Give the shadcn restyle a mechanism that actually reaches shadows and radius

**File:** `skills/neon-redesign/references/style-migration.md`, section 5 (L203-289).

**Gap.** L278-289 tells a `visual-system` restyle to "set `--radius` and the shadow and border variables the file declares so that depth comes from surface steps". A stock shadcn v4 stylesheet declares no shadow variable: `evals/skills/fixtures/shadcn-v4-app/src/index.css` has none, while its components use `shadow-xs` and `shadow-sm` (`src/components/ui/button.tsx:14`, `input.tsx:10`, `card.tsx:9`). shadcn's default theme has none either (`theming.mdx` L205-225). So on the app the eval targets, the instruction changes no shadow. L215-217 also says to leave `@theme inline` unchanged, which is where shadcn pins radius.

**Change.** Add shadcn's own two moves, as mechanisms at `visual-system` tier:
- Shadows: override Tailwind's shadow scale in `@theme` (`--shadow-xs: 0 0 #0000` and the like), per `design-system.md` L197-207. No markup changes.
- Radius: grep which `rounded-*` class each component uses, then pin those `--radius-*` steps in `@theme inline`, per `design-system.md` L163-195.

State the limit plainly: in the fixture, button and input share `rounded-md` (`button.tsx:6`, `input.tsx:10`), so a variable cannot make buttons pill without rounding inputs too. Pill buttons in a stock shadcn app need a `cva` edit (`design-system.md` L289-304), which is markup, so it belongs to `composition: 'adapt'` or needs the owner to widen the tier.

**Constraint risk:** none. It adds a way to do what the file already asks for. Rerun the "look after the values" scenario in `evals/skills/records/design-intent.md`.

### 2. Decide the three theme differences from Base as a theme decision, and record it

**Files:** `theme/css/theme.css`, `registry/ui/card.tsx`, an ADR or `docs/design/`; then `skills/INSTRUCTION.md:42` and `:19` to match.

**Gap.** The skills can only compose what the theme ships. Section 2 shows three places where the shipped theme is not Uber's: navy primary and ink (`theme.css:97`, `:83`) against black; a 24px bordered card (`card.tsx:27`) against a square surface; weight-400 titles capped at 28px (`theme.css:189`, `:203`) against weight-700 headings up to 40px. No skill wording closes these.

**Change.** The owner picks, per item, whether Neon moves toward Base:
- Navy is Core's Theme token, so it changes in Core, not here (ADR 0009). `INSTRUCTION.md:42` and `:48` fix "navy" by name.
- Title weight and card radius are Neon's own (`AGENTS.md:11`). A heavier title conflicts with `INSTRUCTION.md:19`, "weight… not used to shout", so the idea and the value must change together or not at all.
- Keep `research/neon-vs-base-tokens.mjs` as the measure of the distance.

**Constraint risk:** none for the agent. Flag: this is the only recommendation that changes how every Neon screen looks, and it is the owner's call.

### 3. Mark which functional patterns are mechanics and which are defaults

**Files:** `skills/neon-audit/references/functional-patterns.md`, `skills/neon-redesign/references/verification.md:27`.

**Gap.** `INSTRUCTION.md:36` now calls the patterns defaults, but the pattern file still opens "These rules shape new UI" (L3) and gives anatomy as rules: "A row has a title, up to two supporting lines, and a trailing column" (L16), "One leading-media size per list" (L16), "One icon size per context" (L41). `verification.md:27` tells the critique to "use its alternative as the fix" for any habit, with no way for a brief to ask for one. An agent that reads the pattern file after the contract meets the stricter wording last.

**Change.** Follow `craft-floor.md` L3 and L21: split the file into a short list of mechanics that always hold (a dock never overlaps the tab bar; a destructive action is confirmed; shadows only on floating layers; no loop over five seconds) and a longer list headed as defaults the task or the brief can replace, with the reason for each. In `verification.md:27`, a habit the brief asked for by name is not a finding.

**Constraint risk:** this loosens. Flag: it may weaken the results in `evals/skills/records/functional-patterns.md` and `functional-screen-habits.md`; rerun both.

### 4. Run the Design intent scenarios, add a no-skill arm, and delete rules that do not discriminate

**Files:** `evals/skills/records/design-intent.md`, `evals/skills/records/output-quality-blind.md`, then whichever skill lines the result names.

**Gap.** `design-intent.md` records "No run recorded" for all four of its scenarios and says the effect on first-screen and habit results "is unmeasured". The blind comparison pairs the previous package with the revision; no arm runs the same request with no Neon skill. Without that arm there is no evidence of which Neon rules a current model already follows unaided.

**Change.** Run the four scenarios. Add a third arm with no package to the two blind requests (`skill-creator` L169-186). Mark each rule or check that passes in the no-skill arm as non-discriminating (`skill-creator` L234) and remove or shorten it. For each rule that stays, check its form against the failure it fixes (`writing-skills` L248-262): prohibition for a discipline failure, recipe for a wrong shape, required report slot for an omission.

**Constraint risk:** this is the one change that removes constraints on evidence. Cost: twelve more runs per round.

### 5. Critique the screenshots before reading the probe

**Files:** `skills/neon-redesign/references/verification.md:9, 17-20`; `skills/neon-review/SKILL.md:22-33`.

**Gap.** Look and fix runs "after items 1–4" (`verification.md:17`), and item 2 is where the browser probe is run and read (`verification.md:9`). The written critique is therefore produced after the probe's list of flags. `critique.md` L5-16 keeps the two apart because detector output "still anchors judgment": the critique tends to restate the flags.

**Change.** Reorder: take the screenshots and write the critique first, then run the probe and source lint, then fix from both lists. In `neon-review`, say for each finding whether it came from looking or from a tool. Optionally add one subtractive question from `frontend-design` L59 to the critique list: what could be removed with nothing lost?

**Constraint risk:** low. Same steps, new order; one more question in a list that already has seven (`verification.md:21-27`).

### 6. Give immersive pages the "defaults, not choices" calibration

**File:** `skills/neon-create/references/campaign-content.md` (or `theme-brief.md`).

**Gap.** Functional screens have a habits table (`review-checks.md:38-47`). Immersive pages have none: "immersive pages follow their own composition" (`review-checks.md:49`). The one place the owner wants colour and expression is the one place with no description of what a generated page looks like by default.

**Change.** A short list of the looks a model produces unprompted on a landing page, worded as `frontend-design` L45 words it: each is legitimate when the brief asks for it, and none is where free choice should be spent. Add its "spend your boldness in one place" line. No fixes column, no finding severity.

**Constraint risk:** medium. Flag: written as bans, or checked by a lint, this becomes a second habits table and narrows the one surface meant to be free. Keep it to prose the thesis step reads, and leave it out of `neon-review`.

### 7. Flatten the reference chain and add contents to the long files

**Files:** `skills/neon-create/SKILL.md:26`, `skills/neon-redesign/references/verification.md:20-27`, `skills/neon-redesign/references/style-migration.md:1`, `skills/INSTRUCTION.md:1`.

**Gap.** `neon-create/SKILL.md:26` sends the agent to `verification.md`, which sends it on to `new-ui-workflow.md` (L21), `INSTRUCTION.md` (L23-24), `review-checks.md` (L27) and `neon-review/SKILL.md` (L20). Anthropic's guidance is one level from SKILL.md, because second-level files may be read in part. `style-migration.md` is 439 lines and `INSTRUCTION.md` 142, and neither has a contents list; the guidance asks for one above 100 lines.

**Change.** First measure: `node evals/skills/reference-reads.mjs` on existing runs shows whether the second-level files were read whole. If they were not, name them in SKILL.md step 5 directly, or inline the two short passages `verification.md` depends on. Add a contents list to the two long files either way.

**Constraint risk:** none.

### 8. A state and colour-pair page for the registry

**Files:** the registry (a new item or the starter), `scripts/ui-shots.mjs`; then one line in `skills/neon-review/references/review-checks.md`.

**Gap.** A search of this repository's Markdown, JSON and scripts for "showcase" finds nothing. shadcn's skill builds a page that shows each colour role as a pair with its measured contrast (`design-system-page.md` L23, L61-75) and pins hover, focus and pressed states side by side so a screenshot can show them (L25, L143).

**Change.** One page built from Neon items that renders every role pair with its contrast and every control in its pinned states. It gives a theme change (recommendation 2) a before and after, and gives `neon-review` a reference to compare against instead of remembered values (`review-checks.md:26`).

**Constraint risk:** none for the agent. Not checked: whether the separate `neon-showcase` checkout already does this.

### 9. Print the app's facts with one command

**File:** `skills/neon-audit/references/project-inspection.md`, a new script under `scripts/`.

**Gap.** The base is read from manifests by hand (`project-inspection.md:15`). shadcn's skill starts from `shadcn info --json` (`SKILL.md` L16-18).

**Change.** One read-only script that prints base, Tailwind version, theme file, installed `@neon/` items and whether a Finnomena theme is present. The four skills cite it in place of prose inspection steps.

**Constraint risk:** none. It removes reading, which frees attention for design.

### 10. Name the geometry knobs that Blended keeps

**File:** `skills/neon-audit/references/reference-design.md`.

**Gap.** `INSTRUCTION.md:83` says Blended keeps a reference's "radius, spacing rhythm, shadow, type scale and weight", as prose. tweakcn's schema (`types/theme.ts` L5-68) shows the same set as named values: radius, six shadow parameters, letter-spacing, spacing.

**Change.** When a Reference Design is read, extract those values into a small table first, as shadcn's `design-system.md` L106-121 does, then build.

**Constraint risk:** low; it is a note-taking step. Lowest rank because no eval shows Blended pages losing geometry.
