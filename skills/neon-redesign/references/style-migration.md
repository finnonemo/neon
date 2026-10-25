# Style migration procedure

The HOW for `neon-redesign` — what "restyle this UI to Finnomena's brand"
actually means step by step, once
`${CLAUDE_PLUGIN_ROOT}/skills/neon-audit/references/workflow-contract.md`'s
`NeonContext` has established scope (`tier`, `targetPaths`, `preserve`).
For a general "did I actually check the UI I changed" checklist — usable
here and by other neon skills — see
`${CLAUDE_PLUGIN_ROOT}/skills/neon-redesign/references/verification.md`.

## Migration sequence

Use the [redesign workflow](../SKILL.md#workflow): inventory affected styles, map semantic roles, update scoped definitions, update remaining component styles, then verify. Read the format section below matching the actual app; do not load all formats for a single edit.

Local scope means local overrides when a shared token has unrelated consumers. The same hex can represent a primary action, focus or a chart category; map each by meaning before editing. Keep a before/after inventory of changed shared tokens and intentional exceptions for the [verification report](verification.md#restyling-additions).

## Tier scope

Use `NeonContext.tier` from the contract, not a separate vocabulary:

- **`tier: 'colors'`** ("Colors only") — only `--color-*` (or the target
  format's color-token equivalent) changes. Fonts, spacing, radii, and all
  structural dimensions stay exactly as they are.
- **`tier: 'visual-system'`** ("Colors + typography/spacing/radius") —
  also update font, spacing, and radius tokens that are part of the
  brand's visual system per
  `${CLAUDE_PLUGIN_ROOT}/skills/INSTRUCTION.md`
  . Composition remains `preserve` unless explicitly requested as `adapt`;
  tier alone never grants layout redesign.
- `tier: 'cds'` doesn't apply here — that's `neon-create`'s job.

## Chart and status colors

Treat these as two separate categories, not one "colors in a chart"
bucket:

- **Semantic status colors** (success/warning/error, often already named
  `success`/`danger`/`warn` in the target's config or chart library) have
  real Finnomena equivalents — Positive `#009646`, Negative `#d60808`,
  Warning `#f26414` (the pastel container pairs are the
  `Notifications.notification-*-background` tokens in
  `theme/tokens/theme.json`, which resolve to `theme/tokens/colors.json`
  steps). Map these directly: a chart's "success" series color
  becomes Finnomena Positive, not a guess.
- **Arbitrary data-series colors** (the 5 different hues distinguishing
  categories A–E in a bar chart, with no semantic meaning individually)
  are *not* brand colors — they're a data-visualization design decision
  unrelated to Finnomena's primary/secondary/tertiary palette. Don't
  reassign them to Finnomena tokens just because they're colors in a
  themed app. Flag them to the user as a separate decision ("this chart
  has 5 arbitrary series colors — want these restyled to fit the new
  palette, or left as-is since they're not brand colors?") rather than
  silently touching them.

## Format-specific guidance

Before writing any token update, **inspect the target project's actual
existing files** to determine which of these four families it uses — do
not assume it matches this repo's own `theme.css` convention (full
`rgb()`/hex values held directly in the variable, consumed as
`var(--color-fg)`). Record the detected format so the scoped update
matches it exactly.

### 1. Plain CSS / CSS Modules

**Detect:** `:root { --something: ... }` in a global stylesheet, or
`.module.css` files with locally-scoped custom properties, no
`tailwind.config.*` and no `@theme` block.

**Update:** Define/edit custom properties directly on `:root` (global
scope) or on a scoped class/CSS-module root (partial scope — see
**Partial scope — local vs. shared/global tokens** in
`${CLAUDE_PLUGIN_ROOT}/skills/neon-audit/references/project-inspection.md`
and scoped updates above). Values usually hold a complete
color (`#01172b` or `rgb(1, 23, 43)`) referenced directly as
`var(--name)` — this is the same convention
`${CLAUDE_PLUGIN_ROOT}/theme/css/theme.css` itself uses, so its
values can often be used close to verbatim. **Still check** — some
plain-CSS projects also use the bare-component convention from
**shadcn-style** below without using shadcn itself.

### 2. Tailwind v3

**Detect:** a `tailwind.config.js`/`.ts` with a `content`/`purge` array
and a `theme.extend.colors` (or `theme.colors`) object; utility classes
like `bg-blue-600` in markup; no `@theme` block in CSS (that's v4).

**Update:** Add/edit named colors under `theme.extend.colors` in the
config file (e.g. `colors: { primary: '#01172b', ... }`), then replace
component-level utility classes (`bg-blue-600` → `bg-primary`) and any
arbitrary-value usages (`bg-[#2563eb]` → `bg-primary`) that map to a
branded role from semantic mapping. Config values are typically full hex —
no wrapper-function conversion needed here.

### 3. Tailwind v4

**Detect:** an `@theme { --color-primary: ...; }` block inside a CSS file
(often `globals.css` or `app.css`) instead of (or alongside a minimal)
`tailwind.config.js`; Tailwind imported via `@import "tailwindcss";`
rather than the old `@tailwind base/components/utilities` directives.

**Update:** Edit the `--color-*` (and `--font-*`, `--spacing-*`,
`--radius-*` for visual-system scope) variables inside the `@theme`
block directly — Tailwind v4 generates utility classes from these
automatically, so `--color-primary: #01172b;` inside `@theme` makes
`bg-primary`/`text-primary`/etc. available without touching a JS config
file. Component markup then updates the same way as Tailwind v3 (utility
class swap), but the token source of truth is the CSS file, not
`tailwind.config.js`.

### 4. shadcn-style (CSS vars + Tailwind indirection)

**Detect:** a `globals.css` (or similar) with `:root { --primary: ...; }`
declarations where the *values* are bare components, not a full color
(e.g. `--primary: 222.2 47.4% 11.2%;` — three space-separated numbers, no
`hsl(...)` wrapper) **and** a `tailwind.config.js` `theme.extend.colors`
that points back at those same variables wrapped in a color function,
e.g. `primary: 'hsl(var(--primary))'` (or `oklch(var(--primary))` in
newer shadcn setups). This two-layer indirection — CSS var holds bare
components, Tailwind config wraps it in the color function — is the
distinguishing feature versus plain Tailwind v3, where config values are
themselves complete colors.

**Update — the value-format conversion is mandatory here.** You cannot
paste a hex or `rgb()` value into a variable this project consumes as
`hsl(var(--primary))` — the variable must hold exactly what the wrapper
expects. Before writing anything, read the wrapper function in
`tailwind.config.js` (or wherever the var is consumed) to know the target
format, then convert the Finnomena token value into it:

- **Example:** Finnomena's Navy Ink primary is `#01172b`. If the target's
  `tailwind.config.js` has `primary: 'hsl(var(--primary))'`, decompose
  `#01172b` to HSL — `hsl(208.6, 95.5%, 8.6%)` — and write the *bare
  components only* (no `hsl()` wrapper, matching the file's existing
  entries): `--primary: 208.6 95.5% 8.6%;`. Writing `--primary: #01172b;`
  or `--primary: hsl(208.6, 95.5%, 8.6%);` into that file is wrong even
  though both encode the same color — neither matches what
  `hsl(var(--primary))` expects to unwrap.
- If the wrapper is `oklch(var(--primary))` instead, convert to OKLCH
  bare components the same way.
- Update both layers: the CSS variable value in `globals.css`, and (only
  if the semantic name itself needs to change, which is rare) the
  Tailwind config mapping. Usually only the CSS variable value changes —
  the config's `primary: 'hsl(var(--primary))'` line stays untouched
  since it's already pointing at the right variable name.

## Mode-specific values

The literal values below illustrate light-mode conversions, not a complete theme for both schemes. Take actual declarations and applicable dark variants from the [canonical CSS adapter](../../../theme/css/theme.css), using the [design contract](../../INSTRUCTION.md#color-roles) for semantic roles. Preserve the app's existing mode selectors. Do not reuse a light-mode value for a dark surface without checking the actual pair. Hover values must come from established app behavior or a verified canonical role, not an invented ramp.

## Worked examples

These are calibration fixtures, not an automated test suite — read them
to see what "before" and "after" concretely look like at each step, then
apply the same reasoning to a real target project.

### Example 1: Shared Button component, Tailwind v3, hardcoded utility

**Before:** `Button.tsx` shared across the app renders
`className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2"`.
`tailwind.config.js` has no `primary` color defined — `blue-600` is
Tailwind's stock palette, used directly. `tier: 'colors'`.

- **Inventory:** one shared component, one hardcoded color pair
  (`bg-blue-600`/`hover:bg-blue-700`), no existing brand token.
- **Map:** this is the primary call-to-action button role → Finnomena
  Navy Ink (light-mode `#01172b`). Preserve a verified existing hover
  treatment, or inspect the canonical roles and contrast before selecting one.
- **Update shared tokens:** add to `tailwind.config.js`:
  `theme.extend.colors: { primary: 'var(--button-primary)', 'primary-hover': 'var(--button-primary-hover)' }`.
  Define both variables in the affected scope and existing mode selectors,
  using canonical values and the verified hover treatment above.
- **Update remaining:** `Button.tsx` becomes
  `className="bg-primary hover:bg-primary-hover text-white rounded-md px-4 py-2"`.
  `rounded-md`/`px-4 py-2` are untouched — `tier: 'colors'` means spacing
  and radius stay exactly as they are.
- **Verify:** render a screen using `Button`, confirm it's now Navy Ink
  with the correct hover state, confirm click handlers still fire (no
  behavior change), confirm an unrelated component still using
  `bg-blue-600` directly (if any) either also got the swap — because it's
  the *same* shared token in a full restyle — or was intentionally out of
  scope for a partial one.

### Example 2: Page header, partial scope, plain CSS

**Before:** `Header.module.css` has `.header { background: #0f172a; }`
consumed only by `Header.tsx`. Root `:root` in `index.css` separately
defines `--brand-color: #0f172a;` used by a dozen other components. User
asked to restyle "just the header." `tier: 'colors'`.

- **Inventory:** `Header.module.css` (local, header-only) vs. `:root`'s
  `--brand-color` (shared, used elsewhere) — both currently the same hex
  by coincidence.
- **Map:** header background is the primary-ink role → Navy Ink
  (`#01172b`).
- **Scope check:** the header's own rule is local (CSS Module), so no
  conflict — but if `Header.tsx` had instead read `var(--brand-color)`
  directly, that would be a scope conflict per
  `project-inspection.md`'s partial-scope rule, requiring a local
  override in `Header.module.css` instead of editing `:root`.
- **Update:** `Header.module.css`'s `.header` background becomes
  `var(--color-bgPrimary)` when that existing token is in scope. Otherwise
  copy the matching canonical declaration from `theme.css` into the header
  scope and reference it there; retain the app's theme-mode selectors.
  `:root`'s `--brand-color` is left untouched.
- **Verify:** header renders Navy Ink; every other component still using
  `--brand-color` is visually unchanged; header's nav links/interactions
  still work.

### Example 3: Dashboard with a chart, visual-system scope

**Before:** a dashboard page has an unrelated "Recent Activity" list
(out of scope) and a bar chart with a `success` series colored
`#22c55e` and four arbitrary category series colored `#a855f7`,
`#f97316`, `#06b6d4`, `#eab308`. `tier: 'visual-system'`.

- **Inventory:** chart config object with 5 series colors; unrelated list
  component using its own separate styles.
- **Map:** `success` series is a semantic status color → Finnomena
  Positive (`#009646`). The other four are arbitrary category
  distinguishers, not brand colors — flag to the user rather than
  reassign (per **Chart and status colors** above).
- **Update:** chart config's `success` series color updates to
  `#009646`. The other four series colors, and the unrelated
  "Recent Activity" list, are left untouched.
- **Verify:** chart's success bars/lines are now Finnomena Positive
  green; the four category colors are visually unchanged (confirmed
  deliberately, not by omission); "Recent Activity" list is pixel-for-
  pixel unchanged; chart tooltips/legend/interactions still work.

### Example 4: Login form, Tailwind v4, colors + validation states

**Before:** `LoginForm.tsx` renders an email input, a password input, and
a submit button. Colors come from an `@theme` block in `app.css`:
`--color-brand: #2563eb;`, used two different ways in the component —
`bg-brand text-white` on the submit button, and `focus:border-brand` on
both inputs' focus ring. Client-side validation requires `email` (present
and format-checked) and `password` (present, minimum length); an invalid
submit shows an inline per-field error message in `text-red-600` and
keeps the submit button disabled (`disabled:opacity-50
disabled:cursor-not-allowed`) until both fields pass; a valid submit
calls `onLogin(email, password)` and shows a loading spinner on the
button while the request is in flight. `tier: 'colors'`.

- **Inventory:** `app.css`'s `@theme` block (`--color-brand`, one entry,
  no `--color-*` token yet for errors), `LoginForm.tsx`'s utility classes
  (`bg-brand`, `focus:border-brand`, `text-red-600`,
  `disabled:opacity-50`), no other file references `--color-brand`.
- **Map:** the submit button's `bg-brand` is the primary-action role →
  Navy Ink (`#01172b`). The inputs' `focus:border-brand` is a *different*
  role — interactive-highlight/focus — even though the original app
  reused the same `--color-brand` token for both; use semantic mapping: don't
  collapse these back onto one Finnomena color just because the source
  used one token. Focus rings map to Indigo Interactive (`#1817e7`), not
  Navy Ink. The validation error text (`text-red-600`) is a status color,
  not a brand color → Finnomena Negative (`#d60808`), per **Chart and
  status colors** above (the same status-vs-brand distinction applies
  outside charts).
- **Update shared tokens:** `app.css`'s `@theme` block changes
  `--color-brand: #2563eb;` to `--color-brand: #01172b;` and adds two new
  tokens the app didn't previously separate: `--color-interactive:
  #1817e7;` and `--color-negative: #d60808;`.
- **Update remaining:** `LoginForm.tsx`'s submit button keeps `bg-brand`
  (now resolves to Navy Ink automatically). Inputs' `focus:border-brand`
  becomes `focus:border-interactive`. Error text's `text-red-600` becomes
  `text-negative`. `disabled:opacity-50 disabled:cursor-not-allowed` is
  untouched — it's a state-opacity utility, not a color/theme value.
- **Verify — form behavior explicitly, not just appearance:** confirm the
  submit button renders Navy Ink and the input focus ring renders Indigo
  Interactive. Then exercise the form, not just its colors: submit empty
  and confirm the same inline validation errors still appear, now in the
  new negative-red; confirm the submit button is still disabled until
  both fields pass validation; fill in valid values and confirm submit
  still calls `onLogin` and the loading spinner still shows while the
  request is in flight. A CSS-only restyle shouldn't touch the validation
  logic at all, but that must be *checked* after the change, not assumed
  from the fact that only `className` strings and an `@theme` block were
  edited — this is the concrete case
  `${CLAUDE_PLUGIN_ROOT}/skills/neon-redesign/references/verification.md`'s
  "unchanged form/route behavior" acceptance criterion is calibrated
  against.

## Composition adaptation

For an explicit layout or hierarchy redesign, record `composition: 'adapt'` separately from styling tier. Identify existing containers and controls; change presentation within the named scope using the current framework and components. Preserve handlers, routes, service/query contracts, data meaning and essential actions. If styles are already Finnomena, keep them while adapting layout; no new token installation is implied.

Example: move a Vue filter toolbar above the results and stack its controls on mobile. Retain the same bindings and filter/reset handlers; preserve selection and navigation. Verify reading/focus order, every control's reachability and the same filter outcomes using [composition checks](verification.md#composition-additions). A colors-only request cannot authorize this change.
