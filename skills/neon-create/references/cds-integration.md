# CDS integration (frozen, deprecated): apps already on CDS

Read only in an app already on CDS, which is frozen there: for its components, for a review of it, or when changing its theme, providers, dependencies or token configuration. CDS component names, setup and patterns are here; the other references are written for the Neon base and name no CDS component. New apps and rebuilds use the [Neon base](neon-base.md); never add CDS to an app without it, nor Neon or shadcn items to an app on CDS. A working Finnomena app adding a feature skips the setup below.

The CDS Install mode is deprecated: Neon 2.0.0 removes it. Until then it works as this reference describes. Do the requested work on CDS, and in the report say once that the mode is deprecated and which version removes it, and offer a [Rebuild](rebuild.md) on the Neon base. Rebuild only when the employee asks for it.

## Prepare and install

Inspect the target manifest/lockfile, relevant entry and current providers: locate `MediaQueryProvider`, `ThemeProvider`, `ComponentConfigProvider`, `PortalProvider` and the theme passed to them, so a change updates that wiring only if needed and never adds a duplicate provider. Reuse active installation; check actual installed types and version compatibility before changing dependencies. A major-version mismatch is a migration decision. New projects use [scaffold](scaffold.md), not this existing-app procedure.

From the resolved Neon root, when theme installation is needed:

```sh
node "<Neon root>/scripts/install.mjs" <target-dir>
```

This CDS install mode copies four canonical CDS theme files and installs CDS if absent; it does not wire providers or replace component code. `--theme-dir <project-relative-dir>` changes the default `src/theme`; `--package-manager` selects the manager; `--skip-install` leaves dependencies pending. See the installer header for exact semantics.

Customized destination files are protected. Use [conflict handling](../../neon-audit/references/theme-integration.md#installer-conflicts), not deletion or a fabricated force flag. After an I/O failure, inspect partial writes before retrying.

## Required styles and icons

Inspect the existing global CSS/entry imports before adding these. Load each missing import once, in the framework's permitted global-style entrypoint:

```ts
import "@coinbase/cds-web/globalStyles";
import "@coinbase/cds-web/defaultFontStyles";
// When using CDS Icon glyphs; ensure @coinbase/cds-icons is installed.
import "@coinbase/cds-icons/fonts/web/icon-font.css";
```

Provider wiring alone does not load these styles. `globalStyles` supplies the CDS reset, `defaultFontStyles` supplies default font variables, and the icon stylesheet registers the glyph font. Preserve existing framework boundaries and font loading; avoid duplicating working imports. Verify that a real CDS button and icon render and that their font resources load, not merely that the build passes.

## Theme and providers

Use a stable module-scope `createNeonTheme()` result, not unmodified CDS `defaultTheme` or a new theme object on every render. Derive `activeColorScheme` from the app's existing owner, the same one its CSS selectors follow. Reuse its provider tree and preserve the documented order:

```text
MediaQueryProvider → ThemeProvider → ComponentConfigProvider → PortalProvider
```

Pass `neonComponentConfig[activeColorScheme]` from `createTheme.ts` to `ComponentConfigProvider`; without it, text on colored fills (filled buttons, Checkbox checkmarks, the selected Calendar day, DotCount, DotSymbol, Avatar initials) is near-black in dark mode. If the app already has a `ComponentConfigProvider`, merge Neon's entries into its value instead of nesting a second provider. A Calendar given its own `styles` or an Avatar given its own `style` replaces Neon's override, so carry the `--color-fgInverse` entry over.

Use [app-entry.tsx](../../../theme/examples/app-entry.tsx) as the concrete integration example. For server-rendered apps read [SSR boundaries](../../neon-audit/references/project-inspection.md#server-rendered-react). For mode changes read [theme-mode ownership](../../neon-audit/references/theme-integration.md#theme-mode-ownership). Avoid a duplicate theme or font-loading mechanism.

## Component APIs and tokens

Prefer official CDS tooling when available; otherwise inspect installed exports and prop types. Verify current APIs rather than assuming a remembered token inventory.

Use semantic keys such as `color="fg"`, `padding={2}` and `borderRadius="200"` where supported by the installed package. Do not invent `textPrimary`, `medium` or `sm` for those props. Branded spacing/radius/color values reuse tokens; structural dimensions can use documented geometry. Preserve existing geometry unless composition adaptation is requested.

Component-specific defaults use supported `ComponentConfigProvider` configuration or scoped wrappers rather than changing a global token for one component. One exception is Neon's own `neonComponentConfig`: it sets DotCount `color`, Calendar `styles` and Avatar `style`, which CDS's config types omit, because CDS merges them at runtime (verified against 9.26.1; the template browser suite checks the result). Don't extend that to new untyped entries without the same check. Style CDS components through their props: variant, size, layout and spacing props, `accessibilityLabel` for icon-only controls, and breakpoint-driven rendering for responsive changes. CDS `Box` computes to `display: flex` in a row, so a `Box` wrapping stacked content needs `flexDirection="column"`, or use `VStack`. Typography goes through props too: `<Text as="h1" font="title1">` for headings and `font` on `Text` or `Box` for everything else; the starter's `AppRoot` already gives `<body>` the theme font and colors. App stylesheets hold layout for app-owned elements only, and every selector starts with an app class (`.phc-card`, `.phc-table th`). A stylesheet with a bare `body`, `h1`, `p`, `button` or `*` rule fails this. A selector stops at elements the app renders itself: `.field > div` around a `TextInput` reaches the component's root. CDS ships its own reset inside the `cds` cascade layer, so an unlayered app rule that reaches into a component (`button { color: inherit }`, `.nav button { font-size: 0 }`) overrides it unpredictably. Custom theme keys require the supported `ThemeVarsExtended` declaration, not untyped properties bolted onto the theme.

The mapping in [color-overrides.ts](../../../theme/cds/color-overrides.ts) is frozen with the rest of the CDS theme: it keeps the values it had, is not matched to Core and stays provisional, with no design approval claimed, so a color can differ from the Neon base's. Settle a disputed CDS color assignment from that file, and report relevant missing/conflicting roles rather than inventing a palette. The logo is the starter's `Logo` (`<Neon root>/templates/vitejs-cds/src/layout/Logo.tsx`). For fonts, read [font loading](../../neon-audit/references/theme-integration.md#font-loading) only when its configuration or typography changes.

## Moving CSS-styled UI to CDS components

In an app already on CDS, moving its CSS-styled parts onto CDS components is a change the request asks for, never part of a colors-only one. Matching CSS variable names do not guarantee equivalent behavior. Before removing the old CSS import/declarations, inspect:

- Variable scope: whether all relevant content inherits the runtime values.
- Cascade/load order: which declaration actually wins during migration.
- Portals: overlays must still receive the theme outside the normal content subtree.
- Mode ownership: CSS selectors and CDS mode must follow the same source of truth.

Test affected content and an applicable overlay in existing/requested schemes. Remove old declarations only after this evidence supports it; migrate components incrementally.

## Functional patterns

The [functional patterns](../../neon-audit/references/functional-patterns.md) and the [sample data and narrow-table rules](new-ui-workflow.md#sample-data-and-figures) name no component library. In CDS they are built from these. Names are from `@coinbase/cds-web` 9.26.1; confirm every prop in the installed types.

- **Actions:** `Button` takes `variant` (`primary`, `secondary`, `tertiary`, `negative`) and `compact`.
- **Lists:** `ListCell` takes `title`, `description`, `media`, `detail` and `subdetail` for the trailing value, `end` for a trailing control, `accessory="arrow"` for the chevron and `spacingVariant="condensed"` (`compact` is deprecated). `Divider` separates groups.
- **Overlays:** `Tray` takes `pin` (`bottom`, `left`, `right`, …), `title` and `footer`; pick `pin` from the breakpoint tier, read with `useBreakpointTier` in the CDS starter.
- **Empty and loading:** `Fallback` draws skeleton placeholders; pictograms come at 48×48 or 64×64.
- **Icons:** `Icon` takes `size` (`xs`, `s`, `m`, `l`; default `m`) and `active` for the selected navigation icon.
- **Motion:** CDS components animate themselves. For custom transitions, CDS uses 100–150ms for controls, 200–300ms for drawers and modals and 350–500ms for page transitions.
- **Figures:** a numeric column is right-aligned in tabular numerals: `TableCell` takes `justifyContent="flex-end"` and `Text` takes `tabularNumbers`.
- **Narrow tables:** in a two-line row, `ListCell` takes `title`, `detail` and `description`, and cuts `description` to one line unless `multiline` is set.

## Functional screen habits

A review names the habits in the [habits table](../../neon-review/references/review-checks.md#functional-screen-habits), whose fixes are in Neon names. In an app already on CDS the same habits take these fixes; the composition rows there apply unchanged.

| Habit | CDS alternative |
| --- | --- |
| KPI tiles, each with an icon on top and its own tinted fill | The figures as labeled `Text` in one compact band, or each figure in the title row of the list or `Card` it summarizes |
| A chart recolored per bar or point, or categories that change color between charts | A single series keeps one `color`; several series keep a stable `id`, `label` and `color` per category across charts and show a `legend` |
| Hand-rolled zebra rows or uppercase, letter-spaced column headers | CDS `Table` defaults: `variant` unset or `"ruled"`, `compact` for density, `TableHeader` `sticky` on long lists, header labels in the data's own case |
| Saturated custom status chips, or color alone marking a status | A `Tag` with `emphasis="low"` whose text names the status, its `colorScheme` chosen by meaning: `green` success, `yellow` warning, `red` error, `blue` information, `gray` neutral |
| Pagination under an overview list | A "View all" `Link` in the overview's title row; `Pagination` belongs on the full list |
| Figures centered or left-aligned in proportional digits | `TableCell` `justifyContent="flex-end"` and `Text` `tabularNumbers` |
| Cards nested in cards, or a gradient or heavy shadow behind every block | One container per group of related content; whitespace and a `Divider` set the hierarchy |
