# Carbon MCP and the Carbon component checklist: what Neon and Core can adopt

> 2026-11-14 · Sources: carbondesignsystem.com pages listed in each section (all read 2026-11-14); `carbon-design-system/carbon-mcp` at `c8af755` (main, 2026-10-30; latest release v1.14.0, 2026-09-30), whose Carbon Builder skill is v1.3.1; `carbon-design-system/carbon` at `fa75d78` (main, 2026-11-13); `carbon-design-system/carbon-website` at `5e9cd1d`; `carbon-design-system/Carbon-Monitor` at `4c254b6`; npm registry lookups for `carbon-mcp` and `@carbon/mcp` (2026-11-14). Ours: this repository at `4f523bf`, and Core (`pawisssh/design-system`, private) read from a checkout of its main line on 2026-11-14.

The owner asked what Neon and Core can take from Carbon's MCP pages, its component checklist and related Carbon pages. Sections 1 to 6 are facts with citations. Opinion appears only in [section 7](#7-recommendations-opinion). The note is read-only: nothing else was changed, no issue was filed, and no Carbon account or token was created. So every statement about tool parameters and responses comes from Carbon's published skill files, not from calling the server.

**Decided.** The owner answered on 2026-11-14 and 2026-11-15 ("Yes, add it" to open question 1, then "do the rest of the recommendations"): recommendations 1 to 6 are done, each marked below. Open question 2's manual screen-reader passes, and questions 4 to 7, stay open.

Core is private and Neon is public, so this note links Core files by URL (readable only with access to `pawisssh/design-system`) and carries no Core Figma key or node id (ADR 0012). Core's own research already covers Carbon's token tiers and motion. This note links those notes and does not restate them: Core's [ds-foundations note][c-dsf] (section 2, "Carbon: token tiers and atomic layering") and its [ads-tokens note][c-ads] (Carbon motion, border width and layout packages).

**Citation keys.**
- `mcp <path>:<line>` is a file in `carbon-design-system/carbon-mcp` at `c8af75506de4`. For example, `mcp public/skills/carbon-builder/SKILL.md:35` is <https://github.com/carbon-design-system/carbon-mcp/blob/c8af75506de40846f0b0c3e42e068345776a43b7/public/skills/carbon-builder/SKILL.md#L35>.
- `carbon <path>` is `carbon-design-system/carbon` at `fa75d78b0d4b`.
- `web <path>:<line>` is `carbon-design-system/carbon-website` at `5e9cd1da43c3`.
- `mcp Terms:<line>` is the [Terms of Use](https://github.com/carbon-design-system/carbon-mcp/blob/c8af75506de40846f0b0c3e42e068345776a43b7/TERMS_OF_USE.md) and `mcp Make guidelines:<line>` the [Figma Make kit guidelines](https://github.com/carbon-design-system/carbon-mcp/blob/c8af75506de40846f0b0c3e42e068345776a43b7/public/figma-make-kit/guidelines/GUIDELINES.md), both at the same commit.
- `site <path>` is `https://www.carbondesignsystem.com<path>`, read 2026-11-14.

## Could not access

| Gap | Why | Effect |
|---|---|---|
| Carbon MCP server source | Not public. The `carbon-mcp` repository holds the README, Terms of Use, issue templates, the Carbon Builder skill and a Figma Make kit, and no server code (`gh api .../git/trees/main?recursive=1`). The GitHub API reports no licence file. The Terms (`mcp Terms:112`) say "the open-source Carbon MCP codebase" is Apache-2.0, but nothing links to it. | How retrieval and ranking work, and the `code_audit` rule set, are known only from the skill's description of them. |
| Calling the tools | Sign-in needs an IBMid, or a token and session ID generated after an IBMid sign-in. Creating an account is outside a read-only task. | Parameters and response shapes in section 2.3 come from the skill's references at `c8af755`. They are Carbon's documentation of its API, not observed responses. |
| npm package for the server | `@carbon/mcp` returns 404. `carbon-mcp` exists (1.0.2, modified 2025-09-02), but its maintainer is a personal address unrelated to IBM and it lists no repository. | The server ships only as a hosted endpoint. **Do not install the `carbon-mcp` npm package**: it is not Carbon's. |
| `site /getting-started/contributing/documentation` ("Contribute docs") | HTTP 404 on the live site. It is not in the Contributing sidebar. Its source is still in `web src/pages/contributing/documentation.mdx`, but that repository was last pushed 2026-09-30, and the live site has since moved components under `/building-blocks/`. | The documentation templates in section 5 are read from the repository. They may be the pre-restructure version, because the live Button page uses different tab names. |
| IBM Figma Best Practices, the IBM Figma naming convention, `preview.carbondesignsystem.com`, internal `w3.ibm.com` pages (including Code Connect setup) | Not opened. The Figma and w3 pages are IBM-internal or need a sign-in. | The checklist's Design kit items are described only as the checklist states them. |
| carbondesignsystem.com page text | The pages render with JavaScript. WebFetch returned their text only through a summariser, as with the atlassian.design pages in Core's [ads-tokens note][c-ads]. | Site facts are cited to the page URL and paraphrased. Exact values (80%, ~320px, 4.5:1 and 3:1, item counts) were asked for a second time in a targeted read of the checklist and agreed both times. Every tool, parameter and Terms fact comes from GitHub files read verbatim. |

---

## 1. Carbon MCP: what it is

Sidebar under Getting started → Carbon MCP: Overview, Concepts, Onboarding and setup, Prompts, Token conservation (`site /getting-started/carbon-mcp/overview`). All five were read. There is no FAQ, tools or usage page.

1. **Purpose.** Carbon MCP is a remote MCP server that gives an AI client Carbon's current components, tokens, icons, guidance and code examples, so the client does not rely on stale training data (`site /getting-started/carbon-mcp/overview`; `mcp README.md:8-13`).
2. **Planned.** The roadmap lists Carbon Labs context, Carbon Patterns context, agentic migration from Carbon v10 to v11, and agentic migration from other design systems to Carbon (`site /getting-started/carbon-mcp/overview`).
3. **Two halves.** The server supplies the facts. A portable skill, Carbon Builder, tells the agent when to ask for them and how to turn them into code. The README says the pair beats either alone (`mcp README.md`, "Pair it with the Carbon Builder skill"; `mcp public/skills/carbon-builder/README.md`, diagram).
4. **Related tool.** `carbon-design-system/Carbon-Monitor` (Apache-2.0) runs agent reviews of pull requests in Carbon's own repositories, with IBM Bob or Claude Code (`claude -p`). Every Carbon-specific claim in a review is checked against Carbon MCP, and a review with findings ships a Resolution spec file that the author can paste into an agent (Carbon-Monitor `README.md` at `4c254b6`, "What it does").

## 2. Carbon MCP: install, hosting, authentication, tools

### 2.1 Hosting and connection
- **Endpoint.** `https://mcp.carbondesignsystem.com/mcp`, hosted on IBM Cloud, over Streamable HTTP. The minimal `mcp.json` entry is `{"type": "streamable-http", "url": …}` under the name `carbon-mcp` (`mcp README.md:8-13`, `:46-53`).
- **Clients documented.** IBM Bob, Claude Desktop (from the connector directory), Cursor, Figma Make, Claude Code, VS Code, GitHub Copilot, and any client that accepts a remote server URL (`site /getting-started/carbon-mcp/onboarding-and-setup`; `mcp README.md`, Connect table).

### 2.2 Authentication and who may use it
- **IBMid.** OAuth with an IBMid (w3id for IBMers) is the default. A client without OAuth discovery uses a token and session ID generated at `https://mcp.carbondesignsystem.com/mcp/auth/ibmid/web` (`site …/onboarding-and-setup`; `mcp README.md`, "Token and session ID"). The setup page warns Bob users not to save the token at project scope, where it could be committed.
- **Non-IBMers.** The page names one route: a custom connector in Figma Make, enabled by the Figma admin, with a Figma login. It does not say whether a non-IBM IBMid works in other clients (`site …/onboarding-and-setup`).
- **Terms of Use** (last updated 2026-10-27, `mcp Terms`):
  - Code sent to a tool such as `code_audit` is processed in memory and not written to disk, logs or a database. Results, which may include short excerpts of the code, are cached in memory for up to an hour (`:50`).
  - Identity is a keyed hash (HMAC-SHA256) of the email. An encrypted copy of the email and each acceptance record are kept for seven years (`:54`, `:58`).
  - Telemetry, when enabled, records the search text sent to each tool (lowercased), filters, result counts, latency and errors, but not the code sent to `code_audit` (`:72-84`). The Terms give an opt-out by email and no opt-in step, so it appears to be on unless a user opts out (`:86-98`).
  - The service is provided as is (`:110`).
- **Three licence layers.** The hosted service is under the Terms. The Carbon Builder skill is Apache-2.0 (`mcp public/skills/carbon-builder/SKILL.md:6`; `mcp README.md:22`). The server codebase is said to be Apache-2.0 (`mcp Terms:112`), but it is not published (Could not access).

### 2.3 Tools and what they return

Five tools (`site /getting-started/carbon-mcp/concepts`; `mcp README.md`, Tools). The skill notes that every result is JSON sent as a string (`mcp public/skills/carbon-builder/SKILL.md:33`).

| Tool | Input (from the skill) | Returns (from the skill) |
|---|---|---|
| `code_search` | `query`, `filters` (`component_type` React or Web Components, `component_id` only after discovery, `ibm_products`, `asset_type` icon or pictogram, `variant_id`), `size` | Component sources with `imports[]` and `variants[]` (each with `example_clean`, Storybook URL); icons with `import`, `import_stmt`, `available_sizes[]`; a stub variant flagged `example_omitted` with a `requery_hint` (`mcp …/references/data-model.md`; `…/query-protocols.md:46-77`) |
| `docs_search` | `query`, `filters` (`component_id`, `page_type` usage, style, accessibility or code) | Chunks with `page_url`, `anchor_url`, `section_heading`, `chunk_text`, `page_type` (`mcp …/SKILL.md`, Capability Matrix; `…/query-protocols.md:96`) |
| `get_charts` | `framework`, `chart_type`, `mode` (`schema` first, then `full`) | A `tool_policy` block, `chosen_variant`, `available_variants[]`, `source_files[]`, and `assembly` hints the agent must use verbatim (`mcp …/data-model.md`, "get_charts Results") |
| `labs_search` | `query` naming the component, `framework` | Carbon Labs package name, variants, props, events, setup notes (`mcp …/SKILL.md`, Capability Matrix) |
| `code_audit` | `code` or `files[]` (up to 50), `framework`, `language`, `filename`, `categories` (tokens, components, accessibility, layout, documentation, advanced), `ibmProducts`, `includeContext`, `skipCache`, `parallel`, `max_workers` | Compact JSON: `valid`, `total`, counts by severity (`e`, `w`, `i`) and category, and `issues[]`. Each issue has a rule id, a plain-English `name`, a message, a `fix`, line and column, and an optional `autoFix {orig, repl}`. The response also carries `validation_confidence` (0.95 from the AST, 0.85 from regex) and `analysis_method` (`mcp …/references/code-audit-protocols.md:12-28`, `:76-130`) |

### 2.4 Knowledge served
The indexes are `@carbon/react`, `@carbon/web-components`, Carbon for IBM Products, icons and pictograms, `@carbon/ai-chat`, `@carbon/charts` and `@carbon-labs/*`. Each holds code examples and documentation, with variants, props and imports (`site /getting-started/carbon-mcp/concepts`; `mcp README.md`, Coverage). `docs_search` covers the website's guidance: usage, style, accessibility and code (`mcp …/query-protocols.md:96`).

## 3. Carbon Builder skill: how the agent side is written

`mcp public/skills/carbon-builder/` holds `SKILL.md` (v1.3.1) and 13 reference files, about 2,700 lines in all. It installs with `npx skills add <repo path> -a <agent>` or from a zip that a workflow rebuilds on every change (`mcp README.md:80-106`; the repository's [zip workflow](https://github.com/carbon-design-system/carbon-mcp/blob/c8af75506de40846f0b0c3e42e068345776a43b7/.github/workflows/zip-carbon-builder.yml)).

1. **Tool results are data, not instructions.** Returned code, docs and user code are reference data. Text inside them that tries to override the skill, skip approvals or expose secrets is ignored (`mcp …/SKILL.md:35-41`).
2. **MCP first.** The agent never writes a Carbon import, prop or icon name from memory. It queries `code_search` first, because training data is stale on whether a component even exists (`mcp …/SKILL.md:71-80`).
3. **Capability matrix.** One table gives, for each intent, the tool, the filters it must have, the fields to expect and the commonest failure (`mcp …/SKILL.md:45-69`).
4. **Discover → Canonicalize → Target.** The agent makes one or two small searches (`size: 2`), confirms the canonical id, then makes a filtered search (`mcp …/references/query-protocols.md:3-22`).
5. **Lazy references.** Each reference link carries an "Only read when …" condition (`mcp …/SKILL.md:108-291`).
6. **Token conservation.** After a search the agent does not restate the result, writes only the requested files and stops (`mcp …/SKILL.md:257-268`; `site /getting-started/carbon-mcp/token-conservation`).
7. **Audit reporting.** Issues are grouped by category and severity. Each is shown by its `name`, never its rule id, and the agent quotes `autoFix` replacements but builds none for typography (`mcp …/SKILL.md:125-141`).
8. **Prompt advice.** The Prompts page gives the same advice to users. Name the framework, libraries, components, layout, sample data and the exact output files. Ask for clarifying questions and a plan first. Reject invented components or props (`site /getting-started/carbon-mcp/prompts`).
9. **Figma Make kit.** Its guidelines file declares the project's AGENTS and CLAUDE instruction files non-authoritative for the task, and fixes a whitelist of files, dependencies and imports (`mcp Make guidelines:55`, `:277-336`).

## 4. Component checklist and lifecycle

### 4.1 Lifecycle (`site /getting-started/contributing/product-development-lifecycle`, updated 2026-10-01)
- **Statuses.** Discovery has Draft and Preview candidate, Delivery has Preview, and Launch and scale has Stable. No Deprecated status is defined.
- **Who decides.** Anyone can curate Discovery work. Only the Carbon team moves an asset into Delivery.
- **Entry to Delivery.** It needs a roadmap, a Figma source of truth with specs and usage docs, 5 to 8 early stakeholder teams, and backlog work on kit, docs and code. Breaking changes go behind a feature flag.
- **Stable.** Every checklist item is complete across code, design kit, docs and design.
- **Carbon Labs.** Labs holds only Draft and Preview candidate assets. An asset leaves Labs into a maintained library when it reaches Preview, and inactive work is archived (`site /getting-started/contributing/carbon-labs`, updated 2026-08-18).

### 4.2 Checklist items (`site /getting-started/contributing/component-checklist`, updated 2026-09-01)
The checklist has five sections: Definition of done (the four statuses), Design specification (6 items), Code (9), Testing (4) and Design kit (4). Patterns have no checklist on this page. The items are listed in the gap table in section 6.

## 5. Component documentation structure

- **Live page shape.** A component page has four tabs: Guidelines, Specifications, Code and Accessibility. Its header shows a status badge (for example Stable), the library, Storybook and GitHub links, and a last-updated date (`site /building-blocks/core/components/button/guidelines`, updated 2026-10-15). The task's "Usage / Style" names are the older tab names, which the docs template below still uses.
- **Guidelines tab.** Live demo; Overview (when to use, when not to use, variants); Formatting (anatomy, sizes, emphasis, alignment, groups); Content (main elements, overflow); Universal behaviors (states, interactions, loading); one section per variant; Modifiers; Related; References (`site …/button/guidelines`).
- **Specifications tab.** Color tables per variant (element, property, token) with hover, focus, active and disabled; Typography (size, weight, token); Structure (padding, icon spacing and focus inset in px and rem, with spacing tokens); Size (each size's height) (`site …/button/specifications`).
- **Accessibility tab.** Three parts: What Carbon provides (keyboard, behavior), Design recommendations (what a designer must annotate) and Development considerations (what a developer must do). Then an **Accessibility testing status** table per library version: default state, advanced states and keyboard marked Tested (automated, no violations), and screen readers (JAWS, VoiceOver, NVDA) marked Manually tested, for `@carbon/react` 1.119.0 (`site …/button/accessibility`).
- **Templates.** Usage, Style, Code and Accessibility templates exist for components with one variant and with several, plus Pattern templates. An optional "AI presence" section appears in Usage and Style (`web src/pages/contributing/documentation.mdx:25-2112`). The Accessibility template opens with one of two stock descriptions: "annotations needed" or "accessible as is, no designer tasks". It drops Design recommendations when the designer has nothing to do, and renders the status table from an `A11yStatus` component (`web …/documentation.mdx:1971-2016`).
- **Code Connect.** `carbon packages/react/figma.config.json` maps Carbon's v11 Figma library to `@carbon/react`. `carbon packages/react/code-connect/` holds 49 component folders, each with a `<Name>.figma.ts` template. Button's reads the Figma variant (`Size`, `State`, `Style`) and emits the matching JSX and import, including `ButtonSkeleton` for `State=Skeleton`. Each file's header carries the Figma node URL. The design-resources page lists Code Connect under Carbon's Figma and AI tools, with setup on an internal page only (`site /getting-started/designing/design-resources`, updated 2026-07-01).
- **Agent instructions in the code repository.** `carbon packages/react/AGENTS.md` gives React guidelines and the component folder shape: component, stories, MDX docs, tests, and an overview MDX demo the website consumes.
- **Themes, for comparison only.** Carbon tokens are roles that never change across themes, and each of the four themes sets their values (`site /building-blocks/foundations/themes`). Core's ADR 0001 already adopted this. See Core's [ds-foundations note][c-dsf], section 2.
- **Accessibility foundation.** Carbon cites the IBM Accessibility Checklist (WCAG AA, Section 508, EN 301 549) and WCAG 2.1 AA for contrast. The tools it names are the IBM Equal Access Toolkit, Stark and a contrast checker (`site /building-blocks/foundations/accessibility`, updated 2026-09-25).
- **Carbon for AI.** AI-generated content carries an AI label with an explainability popover and a subtle glow style that is never decorative. There are AI variants of 12 components, and an edited AI value reverts to the default style with a way to restore it (`site /building-blocks/foundations/carbon-for-ai`, updated 2026-08-12).

## 6. Checklist against ours

"Core" is Core's [proposal template][c-template], its [structure doc][c-structure] ("Check before handing off", 16 items) and its [architecture doc][c-arch] ("Accessibility", WCAG 2.2 AA). "Neon" is this repository's registry, `evals/templates/` and `evals/skills/`.

| Carbon item | Do we have it? | Where | Gap |
|---|---|---|---|
| **Status levels** (Draft → Preview candidate → Preview → Stable) | Partly | Core: a `> Status:` line with Draft, Approved, Built or Deprecated, plus Revisions (GLOSSARY "Approved doc"). Neon: Counterpart, `notInCore`, `core: null` in `registry/core-counterparts.json` | Neither has a "usable in production, may still change" stage (Preview). Neon does not show an item's standing to employees. |
| Design: color tokens only | Yes | Core: the structure doc, item 6, the template's Theme token table | None |
| Design: type tokens only | Yes | Core: the structure doc, item 8, the template's Text styles section | None |
| Design: structure, measurements, all configurations | Yes | Core: the template's Anatomy, Axes and Component variables sections; the structure doc, items 2–5 | None. Core binds every number, which is stricter than annotation. |
| Design: every interaction state | Yes | Core: the structure doc, item 9, the template's Axes | None |
| Design: behaviors (responsive, overflow, scroll) | Yes | Core: the template's Text styles, wrapping and truncation section; the structure doc, item 10 (Thai strings), the reflow check | Responsive width is in the architecture doc "Regular width", not a template section |
| Design: contrast 4.5:1 and 3:1, focus flow | Yes, stricter | Core: the architecture doc Accessibility (WCAG 2.2 AA), the template's nine-point list | None |
| Code: API principles (deprecate before remove, compose) | Partly | ADR 0009: "1.0 only adds", names and props follow shadcn, `notInCore` values keep working | No written deprecation path for a Neon item or prop value |
| Code: built to spec | Yes | `evals/templates/cds-match.spec.mjs` with `core-baseline.mjs`: Core spec values within ±1px at 375 and 1440, light and dark; `evals/skills/registry.test.mjs` "every Neon component is measured against its Counterpart" | None |
| Code: tokens, no magic numbers | Yes | `evals/skills/registry.test.mjs` (Neon roles, no `dark:` classes), `scripts/source-lint.mjs` for apps (warn-only) | None for the registry |
| Code: globalization (strings through props) | Partly | Core: the architecture doc Localisation (Thai). Neon: the DatePicker `th-TH` check in `neon-a11y.spec.mjs` | No check that registry items take every visible string as a prop |
| Code: responsive to about 320px | Layouts only | `evals/templates/layouts.spec.mjs` runs the shell at 320–1920 | Items are measured only at 375 and 1440, not at 320 |
| Code: Storybook default and playground stories | No (by design) | Neon's fixture screens (approval, extras, expansion) render every item. The Catalog site is referred to in `scripts/lib/core-snapshot.mjs` | No per-item playground for employees. ADR 0009 keeps shadcn's docs as the developer reference. |
| Code: long-form docs | Yes, split | Core docs compiled into `core/components/*.md`; skills read `## Usage` only (`skills/neon-audit/references/core-rules.md`) | None |
| Code: typed props | Yes | Registry items are TypeScript (`registry/ui/*.tsx`) | None |
| Code: codemods for migrations | No | ADR 0009: an app opts in by re-adding items, and skills never upgrade an app unasked | No scripted migration from 0.x or from CDS. This is out of scope today. |
| Test: unit tests over 80% coverage | No | `evals/skills/registry.test.mjs` checks structure, not item behavior | Behavior is checked only in the browser suite. No per-item unit tests. |
| Test: visual regression | Partly | Measured geometry (±1px) plus screenshots kept for inspection (`evals/templates/README.md`) | No pixel diff. Measurements cover the listed properties only. |
| Test: automated accessibility on all complex states | Yes | `evals/templates/neon-a11y.spec.mjs`: axe on three screens and five open overlays, light and dark | axe runs the `wcag2a`, `wcag2aa` and `wcag21aa` tags only, while Core's floor is **WCAG 2.2 AA**. No `wcag22aa` tag appears anywhere in `evals/`. |
| Test: manual screen reader (JAWS, VoiceOver, NVDA) | No | None | No record of manual screen-reader passes, per item or version |
| Kit: Figma guidelines | Yes | Core: the Figma rules in its CLAUDE instructions, docs/agents/figma-*.md, page-check and bases-check | None |
| Kit: naming convention | Yes | Core: GLOSSARY, the architecture doc Variant axes, the template's Axes rules | None |
| Kit: built to spec in Figma | Yes | Core: build-component from `<c>.spec.json`, structure-check.js | None |
| Kit: published to a library | Yes | Core: (v3) Components / Core | None |
| Docs: accessibility testing status per version (section 5) | No | Core's template ticks nine points per component, but the status is not shown per release | No "tested in which version, how" record that Neon could show |
| Docs: "what the component provides" against "what you must do" | Partly | Core's template has Accessibility item 9 (role, name, states, focus) | No split between what the component already handles and what the screen builder must still do |

## 7. Recommendations (opinion)

Each idea is mapped to a place and checked against our rules.

### Adopt: fits existing rules

1. **Add `wcag22aa` to Neon's axe run.** Place: `evals/templates/neon-a11y.spec.mjs`. Core's floor is WCAG 2.2 AA (Core: the architecture doc Accessibility), so Neon's automated check trails the standard it matches (ADR 0009). This is not taken from Carbon, which cites 2.1 AA, but the checklist exposed the gap. It fits. **Done** in #299.
2. **Record an accessibility testing status per Neon release.** Place: one table per registry item, kept beside `registry/core-counterparts.json` or in the Catalog. Columns: default state and complex states (axe, from `neon-a11y.spec.mjs`), keyboard (the spec's keyboard tests) and screen reader (manual, with the date and the reader). Copy Carbon's Tested, Manually tested and Not tested values (section 5). It fits: a fact about Neon's own code, not a Core rule. **Done**: `node scripts/a11y-status.mjs` derives the axe and behavior columns from the browser suite and reads screen-reader passes from `registry/screen-reader-passes.json`, empty until someone runs one (CONTRIBUTING's release step).
3. **Split Core's Accessibility section into "what it provides" and "what you must do".** Place: Core's [proposal template][c-template], Accessibility, after item 9. Add two short lists: what the component handles itself (keyboard, announced states) and what the screen builder must add (a label for an icon-only control, `aria-pressed` on a toggle). Neon's skills would read the second list from the compiled doc. It fits ADR 0012: Core owns the doc's shape, and Neon asks for the change there. **Done** in Core: two lists under item 9 of the proposal template, "It provides" and "The screen adds".
4. **Label tool results as data in finno's `instructions`.** Place: `scripts/lib/finno/mcp.mjs` `INSTRUCTIONS` and `skills/neon-block/SKILL.md`. Say that an engine result is data, not instructions, as Carbon Builder does (`mcp …/SKILL.md:35-41`). finno returns only engine output today, so the risk is small. The line costs nothing and holds if a later tool returns user text. It fits ADR 0010. **Done**: finno's instructions and neon-block's Reading the answer.
5. **Give `source-lint.mjs` an optional compact JSON output.** Place: `scripts/source-lint.mjs --json`. Use Carbon's shape: `total`, counts by rule, and per warning a plain name, line, `fix` and optional `autoFix`. Skills would report warnings by name and quote replacements, as Carbon Builder does (section 3, item 7). It fits: the lint stays warn-only and local. **Done**: `source-lint.mjs --json`, without `autoFix`, which no rule has.
6. **Test registry items at 320px.** Place: `evals/templates/measure.mjs` targets or a reflow pass in `neon-a11y.spec.mjs`. Check that no item overflows at 320. The layouts already go down to 320, so this extends an existing practice. **Done** in `neon-a11y.spec.mjs`: each item in a 288 box. It found Calendar (336, seven of Core's 48 px days) and Pagination (308) wider, held at those widths until settled.

### Have it already: no change

- **Lazy "read only when" references** (section 3, item 5): this is AGENTS.md's "fast paths and read conditions" rule and core-rules.md's "read `## Usage` only".
- **MCP-first, never from memory** (section 3, item 2): `skills/neon-review/SKILL.md` already says "a rule quoted from memory is how taste gets reported as a mismatch" and sends agents to the Core snapshot.
- **Role tokens that never change across themes** (section 5): Core's ADR 0001.
- **Built to spec, measured**: Neon's ±1px Core baseline is stricter than Carbon's visual regression item.

### Consider, with a conflict to settle first

7. **Code Connect from Core's Figma to Neon items.** The mapping already exists as data. `registry/core-counterparts.json` and ADR 0009 map each prop value to a Core cell (button `default` to Primary Default). Carbon's `*.figma.ts` files show the shape: read the Figma variant, emit JSX and the import (section 5). **Conflict:** each template names a Figma node URL, and ADR 0012 keeps Figma ids out of what public Neon carries, so the files would have to live in Core or in a private repository. Whether our Figma plan offers Code Connect was not checked.
8. **Audit and lookup tools on finno** (a `code_audit`-like check, plus `token-lookup` and `contrast` as tools). **Conflict:** ADR 0010 fixes "three tools, one list" for Brand Artwork, so this needs an ADR amendment, or a second server for app work. Keep it local: Carbon's audit sends the user's code to IBM's hosted service (`mcp Terms:50`), and Neon's tools run on the employee's computer and call no network (ADR 0010).
9. **A Preview stage.** Neon could mark an item whose Counterpart doc is a draft as usable but subject to change. Checkbox is the current case (ADR 0009: "Core's doc is a draft"). **Conflict:** ADR 0009's growth rule requires an approved Counterpart for new items, so Preview could only label the four existing exceptions, not admit new ones.

### Don't adopt
- **Connecting Carbon MCP to Neon's skills.** Neon matches Core, not Carbon (ADR 0009), and the instructions forbid installing a third-party design system (`skills/INSTRUCTION.md`). Carbon facts would compete with Core's rules.
- **The Figma Make kit's "AGENTS.md is non-authoritative" rule** (section 3, item 9). Neon's skills depend on the app's own instructions being read.
- **Storybook and codemods** for now. ADR 0009 keeps shadcn's docs as the developer reference and makes apps opt in by re-adding items.

## 8. Open questions for the owner

1. Should Neon's axe run move to WCAG 2.2 AA (`wcag22aa`) now, so it meets Core's floor? A new rule may surface violations in the current items.
2. Do you want a per-release accessibility testing status for Neon items, and who would run the manual screen-reader passes (VoiceOver and NVDA at least)?
3. Should Core's proposal template gain the "what the component provides / what you must do" split in its Accessibility section? It is a Core change, and Neon would ask for it there (ADR 0012).
4. Is Code Connect from Core's Figma file wanted at all? If so, does our Figma plan include it, and should the templates live in Core, given that Neon is public?
5. Should finno grow app-side tools such as lint, token lookup and contrast? That would amend ADR 0010's single tool list, or add a second local server.
6. Is a "Preview" standing worth showing employees for the four items that keep CDS tuning or a draft Counterpart?
7. Carbon's documented non-IBM route is Figma Make only. If anyone at Finnomena wants to try Carbon MCP for comparison, should that wait until IBM states which accounts may use it?

[c-template]: https://github.com/pawisssh/design-system/blob/main/docs/components/_template.md
[c-structure]: https://github.com/pawisssh/design-system/blob/main/docs/components/structure.md
[c-arch]: https://github.com/pawisssh/design-system/blob/main/docs/architecture.md
[c-dsf]: https://github.com/pawisssh/design-system/blob/main/docs/research/ds-foundations.md
[c-ads]: https://github.com/pawisssh/design-system/blob/main/docs/research/ads-tokens.md
