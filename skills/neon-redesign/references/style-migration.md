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

## Tailwind mapping rules

Applies to Tailwind v3 and v4 alike, including apps that use the stock
palette (`bg-slate-900`, `text-blue-600`) with no brand tokens yet.

- **Map by the utility's role, not the nearest value.** `text-*` and
  `placeholder-*` take `fg*` tokens. `bg-*` takes `bg*` surface or wash
  tokens. `border-*`, `divide-*`, `ring-*` and `outline-*` take `bgLine*`
  tokens, and focus indicators take `bgLinePrimary`. Never put a `bg*` or
  `bgLine*` token on text, or an `fg*` token on a surface, even when the
  value looks right: `text-slate-900` is primary text (`fg` or
  `fgPrimary`), not `bgPrimary`.
- **Swap utilities at the call site.** Do not redefine stock palette
  names (`--color-slate-900`, `--color-blue-600`, `--color-white`) in
  `@theme` or `:root`. A global alias makes class names lie
  (`bg-slate-900` renders navy), recolors chart and category uses, and
  forces one name to serve text, surface and border roles at once.
  Reference the adapter variable directly (`text-[var(--color-fgMuted)]`,
  or `text-(--color-fgMuted)` in v4), or register a *new* semantic name
  (`--color-fg-muted: var(--color-fgMuted)` in v4 `@theme inline`, or a
  `theme.extend.colors` entry in v3), then use that name.
- **Keep pale shades pale.** `-50` to `-200` borders and washes
  (`border-green-200`, `bg-red-50`) map to a wash or `accentSubtle*` token
  whose lightness matches the original shade. With no pale-enough token,
  keep the stock utility and report the gap; never substitute the
  saturated status token (`bgPositive`) for a pale border.
- **Keep shade hierarchy.** The adapter has only `fg` and `fgMuted` for
  text. If `slate-400`, `slate-500` and `slate-600` carry distinct jobs
  (placeholder, caption, secondary text), decide per call site and report
  the steps that collapse. Text lighter than `fgMuted` (disabled,
  placeholder, inactive icons) keeps its stock utility; never darken it.
  Do not invent extra tokens; the mapping is provisional.
- **Map state, not just shade.** A selected tab or chip takes the indigo
  interaction signal (`bgLinePrimary` border or indicator), not navy text
  alone. One shade-threshold table applied across a file is value
  mapping; check each call site's state.
- **Leave non-brand colors.** Category dots, chart series and
  illustrative accents follow **Chart and status colors** above. Markers
  that distinguish sections from each other keep that distinction or are
  reported; do not collapse them onto one token.

## Format-specific guidance

Before writing any token update, **inspect the target project's actual
existing files** to determine which of these five families it uses — do
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
**shadcn-style on Tailwind v3** below without using shadcn itself.

### 2. Tailwind v3

**Detect:** a `tailwind.config.js`/`.ts` with a `content`/`purge` array
and a `theme.extend.colors` (or `theme.colors`) object; utility classes
like `bg-blue-600` in markup; no `@theme` block in CSS (that's v4).

**Update:** Add/edit named colors under `theme.extend.colors` in the
config file (e.g. `colors: { primary: '#01172b', ... }`), then replace
component-level utility classes (`bg-blue-600` → `bg-primary`) and any
arbitrary-value usages (`bg-[#2563eb]` → `bg-primary`) that map to a
branded role from semantic mapping. Config values are typically full hex —
no wrapper-function conversion needed here. Follow
[Tailwind mapping rules](#tailwind-mapping-rules); never override stock
palette names under `theme.colors`.

### 3. Tailwind v4

**Detect:** Tailwind imported via `@import "tailwindcss";` rather than
the old `@tailwind base/components/utilities` directives, usually with
no `tailwind.config.js`. An `@theme { --color-primary: ...; }` block
(often in `globals.css` or `app.css`) may hold the app's own tokens; an
app with only the import and stock utilities (`bg-slate-900`) has none.
When `@theme inline` maps names to variables that `:root` and `.dark`
declare (`--color-primary: var(--primary);`), the app is
[shadcn-style on Tailwind v4](#5-shadcn-style-on-tailwind-v4); use that
section instead.

**Update:** Follow [Tailwind mapping rules](#tailwind-mapping-rules).
When `@theme` already holds the app's own semantic names
(`--color-primary`, `--color-brand`), edit their values there for a
global change; Tailwind v4 regenerates `bg-primary`/`text-primary`
from them. With stock utilities only, make the adapter's color variables
available per [CSS setup](css-integration.md#css-setup) and swap
utilities at the call site (`text-slate-500` →
`text-[var(--color-fgMuted)]`); do not add `@theme` entries for stock
names. For visual-system scope, `--font-*`, `--spacing-*` and
`--radius-*` follow the same rule: own names only.

`@theme inline` copies the variable's value into each utility, so a
selector-scoped override such as `input:focus { --color-blue-600: ...; }`
never reaches `border-blue-600`. Express state at the call site with a
variant instead: `focus:border-[var(--color-bgLinePrimary)]`.

### 4. shadcn-style on Tailwind v3 (CSS vars + Tailwind indirection)

**Detect:** a `globals.css` (or similar) with `:root { --primary: ...; }`
declarations where the *values* are bare components, not a full color
(e.g. `--primary: 222.2 47.4% 11.2%;` — three space-separated numbers, no
`hsl(...)` wrapper) **and** a `tailwind.config.js` `theme.extend.colors`
that points back at those same variables wrapped in a color function,
e.g. `primary: 'hsl(var(--primary))'` (or `oklch(var(--primary))`).
Variables holding complete `oklch(...)` colors, mapped by `@theme inline`,
are [shadcn-style on Tailwind v4](#5-shadcn-style-on-tailwind-v4). This two-layer indirection — CSS var holds bare
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

### 5. shadcn-style on Tailwind v4

Current shadcn/ui output, including v0 and Lovable projects.

**Detect:** `@import "tailwindcss";`, `:root` and `.dark` blocks that
declare complete colors (`--primary: oklch(0.205 0 0);`), and an
`@theme inline` block that maps each one to a utility name
(`--color-primary: var(--primary);`). Usually there is also
`@custom-variant dark (&:is(.dark *));` and a `components.json`, and no
`tailwind.config.*` color mapping. Some v4 files hold `hsl(...)` values
instead; keep whichever color function the file uses.

**Update:** edit the values in `:root` and `.dark` only. Markup using
`bg-primary` or `ring-ring` then follows, so component files keep their
shadcn utilities. Leave `@theme inline` unchanged unless a role needs a
new semantic name; then declare the variable in both `:root` and `.dark`
and map it in `@theme inline`, as shadcn does for its own tokens.

Take each value from the same mode of
`${CLAUDE_PLUGIN_ROOT}/theme/css/theme.css`: `:root` from its `:root`,
`.dark` from its dark block. A role the dark block does not redeclare,
such as `bgLinePrimary`, keeps its `:root` value. Convert to the file's
color function and keep alpha: Navy Ink `rgb(1, 23, 43)` becomes
`oklch(0.199 0.050 247.2)`, and `fg`'s `rgba(0, 0, 0, 0.851)` becomes
`oklch(0 0 0 / 0.851)`. Do not import the adapter and reference its
variables from `.dark`: it switches mode on `prefers-color-scheme` and
`[data-theme]`, not on `.dark`, so those references can resolve to the
light value. See [Mode-specific values](#mode-specific-values).

Map shadcn's roles by their meaning in shadcn:

| Variable pair | Job in shadcn | Adapter role |
| --- | --- | --- |
| `--background` / `--foreground` | Page | `bg` / `fg` |
| `--card`, `--popover` / their `-foreground` | Raised surfaces | `bgElevation1`, `bgElevation2` / `fg` |
| `--primary` / `--primary-foreground` | Primary action | `bgPrimary` (Navy Ink) / `fgInverse` in light, `fg` in dark |
| `--secondary` / `--secondary-foreground` | Secondary button | `bgSecondary` / `fg` |
| `--muted` / `--muted-foreground` | Quiet surface and secondary text | `bgAlternate` / `fgMuted` |
| `--accent` / `--accent-foreground` | Hover, focus and selected surfaces (ghost buttons, menu items, rows) | A quiet neutral surface such as `bgSecondary` / `fg`; not an `accent*` token or indigo |
| `--destructive` | Destructive fill and error text | `bgNegative` (Negative) |
| `--border`, `--input` | Dividers and control outlines | `bgLine`; check that input outlines stay visible |
| `--ring` | Focus | `bgLinePrimary` (Indigo Interactive) |

Change each role together with its `-foreground`, in both `:root` and
`.dark`. shadcn's default `.dark` has a light `--primary` with dark text,
so replacing only the background leaves dark text on a dark button. Do
not copy the dark `fgInverse` for that label: it is black, for text on
the white dark-mode `bgInverse`, and measures 2.4:1 on dark `bgPrimary`.
Text on a colored fill is `fgInverse` in light and `fg` in dark, per
`onColorLabel` in `${CLAUDE_PLUGIN_ROOT}/theme/cds/color-overrides.ts`.

Current shadcn has no `--destructive-foreground`: its destructive button
and badge use `text-white`, over `dark:bg-destructive/60` in dark. At
`colors` tier, do not add a variable or edit those components. Measure
the rendered destructive button and `text-destructive` text in both modes
and report a failure. A
file that declares `--destructive-foreground` changes it with
`--destructive`.

The `--sidebar-*` set mirrors the same roles (`--sidebar-primary`,
`--sidebar-accent`, `--sidebar-border`, `--sidebar-ring`) and changes
with them, even though shadcn's default dark `--sidebar-primary` is blue.
`--chart-1` to `--chart-5` are category colors: leave them and ask, per
[Chart and status colors](#chart-and-status-colors). `--radius` is
geometry and changes only at `visual-system` scope.

Verify by toggling `.dark`: primary and destructive labels, the focus
ring and input outlines in both modes.

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
  Navy Ink (`--color-bgPrimary`). The inputs' `focus:border-brand` is a
  *different* role — interactive-highlight/focus — even though the
  original app reused the same `--color-brand` token for both; use
  semantic mapping: don't collapse these back onto one Finnomena color
  just because the source used one token. Focus rings take the indigo
  interaction signal (`--color-bgLinePrimary`), not Navy Ink. The
  validation error text (`text-red-600`) is a status color, not a brand
  color → Finnomena Negative (`--color-fgNegative`), per **Chart and
  status colors** above (the same status-vs-brand distinction applies
  outside charts).
- **Update shared tokens:** with the adapter variables available per
  [CSS setup](css-integration.md#css-setup), `app.css` moves
  `--color-brand` into `@theme inline` as
  `--color-brand: var(--color-bgPrimary);` and adds two names the app
  didn't previously separate: `--color-interactive:
  var(--color-bgLinePrimary);` and `--color-negative:
  var(--color-fgNegative);`. Reference the adapter variables; do not copy
  hex values from `theme/tokens/colors.json`. The raw palette and the
  adapter can differ (`bgLinePrimary` is not the raw `#1817e7` indigo
  step), and only the variables follow mode selectors and future mapping
  changes.
- **Update remaining:** `LoginForm.tsx`'s submit button keeps `bg-brand`
  (now resolves to Navy Ink automatically). Inputs' `focus:border-brand`
  becomes `focus:border-interactive`. Error text's `text-red-600` becomes
  `text-negative`. `disabled:opacity-50 disabled:cursor-not-allowed` is
  untouched — it's a state-opacity utility, not a color/theme value.
- **Verify — form behavior explicitly, not just appearance:** confirm the
  submit button renders Navy Ink and the input focus ring renders the
  `bgLinePrimary` indigo. Then exercise the form, not just its colors: submit empty
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
