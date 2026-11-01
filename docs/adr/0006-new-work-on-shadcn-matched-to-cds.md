# New work is built on shadcn/ui, matched to CDS

Neon's base for new work moves from CDS to shadcn/ui on Tailwind v4, with Radix primitives and React 19, and Neon is distributed as a shadcn registry. A new app starts with `shadcn init` from Neon's base item, and an existing app takes Neon's items with `shadcn add`. The installer keeps only CSS-only, for apps without React or Tailwind.

The look must match CDS. Theming, sizing and spacing come from the same Neon roles and type scale the CDS starter uses. Behavior follows Radix, and it changes only where it would be less accessible than CDS.

Neon owns its component files, the way CDS owned its own. The registry ships tuned components and a `cn` that keeps Neon's type roles, and skills add `@neon/<item>`, never a stock shadcn item. The CDS install mode and the CDS theme files are frozen for apps already on CDS: they get bug fixes only, and retiring them is a separate decision.

Why: the throwaway spike on branch `spike/shadcn-base` (its FINDINGS note) rebuilt the approval screen on shadcn.
- It matched the measured CDS type, button, input and checkbox sizes, the role colors in light and dark, and the pane layout at six widths.
- Its JS and CSS bundle was 340K against CDS's 764K.
- CDS's JS-computed colors kept blocking Immersive Themes, whose colors are CSS custom properties.

React 19 is required because, on React 18, the current Radix sends focus to `<body>` when a Dialog or menu closes. The spike's React 19.1.1 copy returned focus with no code change.

## Requirement: sizing and spacing match CDS

The spike's `measure.mjs` and `extras-check.mjs` become an eval.
- **Baseline:** CDS starter measurements are kept as a JSON fixture, since CDS is frozen.
- **What runs:** the same screens are rendered from the shadcn starter at 375px and 1440px, in light and dark.
- **What is compared:** font size, line height and weight, the heights of buttons, inputs and list rows, padding, and the gaps between neighboring elements, within ±1px.
- **Coverage:** every component the registry ships is measured, including the overlays the spike left untuned (its Select trigger was 36px against CDS's 54px).

## Consequences

- The spike's traps become registry guards:
  - `cn` drops custom type roles.
  - `shadcn add` overwrites tuned files and imports a bare `cn`.
  - shadcn ships its own dark-mode classes.
  - Tabs fail axe when used as a segmented control.
- Tag text roles, `--ring` and `--input`, and the 4.32 contrast of the negative button in dark mode get provisional roles. Each waits on a design-owner issue.
- Skills, evals, the glossary's install-mode and tier terms, and the Rebuild definition still assume CDS. They move in a separate migration.

## Considered Options

- **Replace CDS everywhere at once:** rejected, because apps already on CDS would lose theme fixes overnight.
- **Keep both bases long term:** rejected, because every skill and eval would need two paths.
- **Keep the installer and ship a shadcn starter template:** rejected, because a registry lets existing apps take single items and drops the installer's source-tree guard for new apps.
- **Base UI or React Aria primitives:** not tried. Radix is the only base the spike measured.
