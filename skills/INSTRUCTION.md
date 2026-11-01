# Finnomena product design contract

This is the shared visual direction for Neon feature building, based on the maintainer's September 2026 brief. It defines intended usage; it does not claim design approval of the provisional CDS mapping.

## Ownership

- **User brief:** product behavior, audience, content, scope, and explicit exceptions.
- **This contract:** Finnomena visual language and semantic color usage.
- **theme/tokens/:** exported foundation values. **theme/cds/color-overrides.ts:** provisional mapping to CDS roles; **theme/cds/theme.config.ts:** generated spacing, radius and typography. **theme/css/theme.css:** CSS adapter. **theme/immersive-themes.json:** provisional Immersive Themes, generated into theme/css/immersive-themes.css.
- **Installed @coinbase/cds-web types and official docs:** actual components, props and theme extension APIs.

For functional layouts, the style means restrained, task-led composition and strong hierarchy. Immersive layouts may be colorful and expressive. It is a design direction, not a measurable 99% match or a dependency requirement. For React/CDS feature work, implement with CDS. CSS-only work preserves its framework and styling tier; review-only work does not install components. Do not install a third-party design system, copy third-party assets, or replace Finnomena fonts with a third-party typeface.

## Color roles

| Role | Treatment | Current adapter guidance |
| --- | --- | --- |
| Structure and primary actions | Navy ink, white, quiet neutral surfaces | `bg`, `bgAlternate`, `fg`, `fgMuted`, `bgPrimary`; primary action maps to navy |
| Interaction highlight | Indigo for focus, selection and links | `bgLinePrimary` currently maps to focus indigo; inspect component types and contrast before reusing as text |
| Status and support | Success, warning, error or information only where that meaning exists | `fgPositive`, `fgNegative`, `bgPositiveWash`, `bgNegativeWash`, `bgWarning` and related semantic roles |
| Accent and illustration | Purposeful secondary color in supporting content | Existing `accent*` roles; yellow is optional. Immersive pages take accent and action from their Immersive Theme; Reference-led pages have no mandatory CTA color, palette pair or per-screen quota |
| Charts and categories | Stable, labeled category assignments | Preserve domain meaning and legends; don't recolor every series to navy/indigo |

Functional UI should read as navy/white with restrained indigo interaction signals. Do not make every card, heading, or action indigo, assign random colored dashboard tiles, or use status colors as generic decoration. Pair status color with text or an icon. Illustrations may use the supporting palette without determining the app chrome.

Current exported tokens still include black-alpha text, black dark surfaces, and inherited CDS fallback slots. Preserve their traceable values; this direction does not authorize inventing a replacement navy ramp. Report a concrete mismatch when it affects the requested screen. An indigo border token is not automatically an accessible link color. Verify actual foreground/background combinations in the affected mode.

## Composition

Start from the employee's main task and the information needed to complete it. Use typography, alignment, whitespace and subtle dividers to establish hierarchy. Use containers when they group related content; avoid card-within-card treatment or decorative gradients as the default product scaffold.

**Functional screens:** prioritize scanning, comparison and action. Forms use clear labels, nearby help and validation. Tables suit dense comparisons; lists suit short summaries. A detail pane earns its space when users need to inspect and act on a selected record. Reuse the existing shell. In the starter, `AppShell` supplies list/detail emphasis, `ContentLayout` emphasizes the main content, `SimpleLayout` omits the inspector, and `MultiColumnLayout` is for explicit board workflows. These names are not guaranteed exports in an existing app.

**Immersive screens:** color the page from one Immersive Theme unless its reference design is Reference-led. The [themes](../theme/immersive-themes.json) are Club (white canvas), Exclusive (yellow), Private (light grey) and Ultra (navy), from the Finnomena Guidelines v1 membership levels, and are provisional pending design owner review. Copy the [generated theme CSS](../theme/css/immersive-themes.css) into the app, set `data-immersive-theme` on the page root, and color sections only with its `--immersive-*` properties: canvas and text; the theme's own `palette-100/75/50/25` steps; the `accent-*` steps (Ultra adds `support-*`); the guideline's secondary `green-*`, `blue-*`, `purple-*`, `red-*` and `orange-*` steps, shared by every theme for highlights, tags and illustration blocks, each with its `on-*` text color; and `action`/`on-action` for the main action. Keep secondaries to small blocks so the theme's own colors lead, and away from data where green or red would read as status. On Exclusive, Private and Ultra `palette-100` is the canvas, so stepped blocks there start at 75. Changing that one attribute switches theme, so an open direction can be shown as the themes and a review build can offer a theme toggle. Within a theme follow the guideline: text only in White or Navy, tints by step rather than opacity, one color family per background block, and no gradients. Use a focused reading sequence, clear proposition, relevant imagery and an identifiable next action. Keep status colors semantic when communicating system feedback. `ImmersiveLayout` is a starter option, not a mandatory landing-page recipe.

**Reference-led immersive pages** keep the thinner [Brand Floor](#reference-designs-and-brand-intensity) instead of a theme: they may keep just IBM Plex Sans Thai and a few Finnomena colors, navy/white need not dominate any section, and [palette-based gradients](#gradients) are allowed when they support the story. Choose accessible action colors for each surface; navy, yellow and indigo are not mandatory hero or CTA colors. A white action suits dark or saturated surfaces: give it a dark label, and on a light surface a visible boundary of at least 3:1. Scope such action colors to the page; the shared primary mapping stays navy for functional screens. A user-supplied reference design contributes only what its Brand Intensity allows; it never supersedes the Brand Floor.

## Gradients

Gradients belong on Reference-led immersive surfaces, since an Immersive Theme uses none, such as a hero field, a card or a section fading into the next, not on functional scaffolding. Build them from these recipes. The recipes are provisional: they are derived from Finnomena campaign files, not design-approved. Keep them page-scoped, in the page's own styles, never in theme files or shared theme variables. Direction, angle and coverage are free.

| Recipe | Stops | Text at every stop | Seen in |
| --- | --- | --- | --- |
| Tint fade | One family, 100 or 75 → 25 of the same family, or → transparent into the next section | Navy, on Yellow, Light Grey, Green, Blue, Teal, Orange, Red or Magenta | Club card and footer fades |
| Navy depth | Navy/100 → Navy/75 | White | Club Ultra card |
| Field to navy | A family's 25 or 50 → Navy/100 | Placement-dependent | KKP hero |

Write each stop as its `theme/tokens/colors.json` hex, or as an existing theme variable with exactly that value, such as `accentBoldGray` for Navy/100. Any other color, including a near-palette tint from a design file, is a new brand value. Text and actions over a gradient need 4.5:1, or 3:1 for large text, against every stop beneath them. Where a stop fails, move the content, add a scrim from a recipe stop or choose another recipe.

## Reference designs and Brand Intensity

A reference design is an outside style description (for example from Refero Styles) that the employee supplies for a campaign or landing page. Brand Intensity decides how much of it survives. It applies to campaign and landing pages only; functional screens use this contract and take at most section structure from a reference.

| Brand Intensity | Reference design keeps | Finnomena supplies |
| --- | --- | --- |
| Finnomena-led | Section structure and reading sequence | Everything else in this contract |
| Blended (default) | Also geometry (radius, spacing rhythm, shadow, type scale and weight) and motion | Palette, typeface, logo |
| Reference-led | Also its colors, such as a dark canvas, accents and action colors | Typeface, logo, at least one identifiable Finnomena color |

**Brand Floor**, kept at every level: the Finnomena logo, IBM Plex Sans Thai, at least one identifiable Finnomena color, accessible contrast for text and actions on every surface, including every gradient stop beneath them, and no source-brand logo, imagery, illustration, copy, product name or font file. Status colors stay semantic. Below Reference-led, a reference's accent color becomes the matching Finnomena role; an action may still be white or another accessible neutral. Colors kept from a reference stay page-scoped and never become new values in the shared theme. A reference's gradient keeps its placement, direction and coverage wherever its geometry survives, while its stops become a [gradient recipe](#gradients); at Reference-led, a gradient made only of the reference's neutral surface colors may keep them.

## Task-based choices

These are decision aids, not mandatory screen templates or approved visual exemplars. Reuse the app's current components before introducing a new layout abstraction.

| User task | Useful composition | Selection criterion |
| --- | --- | --- |
| Compare many records across the same attributes | Table with aligned columns and clear headers | Comparison benefits from shared column alignment; keep key columns/actions reachable on narrow screens |
| Scan short summaries and open one record | List with selected detail | Add a side panel only if simultaneous context helps the decision; otherwise a detail view with a return path is enough |
| Enter related information | Labeled form groups with nearby help/errors | Group by meaning; use multiple steps only when the task has a real sequence, not to decorate a short form |
| Filter a collection | Toolbar near results and a no-match state | Preserve query and selection semantics; let controls wrap/stack without hiding filtering on small screens |
| Understand a product or campaign | Immersive reading sequence with meaningful imagery and a next action | Expressive surfaces should clarify the story; the action must contrast with its local background |

For existing screens, apply these decisions only within authorized composition changes. Colors-only and an ambiguous “make it Finnomena” request preserve structure. In `composition: 'adapt'`, improve hierarchy, grouping or responsive presentation without changing routes, handlers, services or data meaning.

## Typography, geometry and assets

Use IBM Plex Sans Thai via the app's font loader, with both Thai and Latin verified. Use the generated CDS typography roles and shipped spacing/radius tokens. Structural widths and responsive geometry may use documented layout dimensions; do not prohibit every numeric CSS value. Preserve geometry during colors-only work.

Use `templates/vitejs-cds/src/layout/Logo.tsx` and its SVG assets when the starter is available; select the mark for its actual surface. Do not recreate the wordmark as text. Existing apps reuse their approved assets.

## Feature states and narrow screens

Implement the states relevant to the task: loading, empty, error with recovery, validation, disabled/pending, success and selection, each reached through real conditions rather than a state switcher in the UI. Preserve entered data after recoverable failures. Reuse real service contracts. Mock data alone does not make an app a demo: ship a production-grade UI and report mocked behavior and missing integration in the delivery report. Label mock behavior in the UI only when the request asks for a demo, prototype or mock-labeled build. Do not invent authentication or persistence.

On narrow screens, retain the main task and a way to reach navigation/details. Stack or progressively reveal panels; do not simply hide essential actions. Allow long Thai/English labels to wrap. Check keyboard focus, control names, dialog focus return and reduced motion when applicable.

## Illustrative example: approvals

Show a scannable pending list and selected request details. Use navy for the main approval action, an indigo selection/focus indicator, and labeled semantic status badges. A reject action uses the appropriate destructive treatment. Include empty, pending, failure/retry and completion states. On a narrow screen, open details with an obvious way back to the list. Preserve the existing router, providers and approval service; a mock must not imply a real approval occurred.

## Illustrative example: immersive campaign

A product landing page on the Exclusive or Private theme gets a substantial yellow or blue-grey canvas, stepped tint blocks from its palette and accent, colorful Finnomena illustrations and the theme's navy action; on Ultra the page is navy with a white action and a navy label. Keep navigation, forms and status feedback legible and familiar. This expressive composition is appropriate for an immersive story; do not carry its decorative panels into a dense approvals workspace by default.

## Illustrative example: responsive request form

Group requester information separately from request details, retain the current field names, validation and submit handler, and put errors near the affected field. Use a navy primary submit action and an indigo focus indicator. A narrow layout stacks existing groups in a meaningful reading order; it does not remove required fields. For colors-only work, change semantic colors while retaining the original groups and spacing. These examples are explanatory, not formal Finnomena design approval.
