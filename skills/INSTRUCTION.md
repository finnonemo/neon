# Finnomena product design contract

This is the shared visual direction for Neon feature building, based on the maintainer's September 2026 brief. It defines intended usage. Colors and type sizes that trace to Core are Core's decisions; the Immersive Themes, the gradient recipes and a color role with no Core token are provisional, with no design approval claimed.

## Ownership

- **User brief:** product behavior, audience, content, scope, and explicit exceptions.
- **This contract:** Finnomena visual language and semantic color usage.
- **theme/tokens/:** exported foundation values. **theme/css/theme.css:** CSS adapter, which the Neon base's theme item maps to shadcn slots and type-role utilities. Its font family and weight, space and radius were captured from the CDS theme that Neon 2.0.0 removed. Its colors come from Core's Theme tokens; a color role with no Core token stays provisional. Its type sizes and line heights come from Core's text styles (see [Typography](#typography-geometry-and-assets)). **theme/immersive-themes.json:** provisional Immersive Themes, generated into theme/css/immersive-themes.css.
- **Core snapshot (`core/`):** component rules: which component fits a job, its hierarchy, states and usage. This contract keeps brand and screen-level rules and links the snapshot instead of restating a component's; where the two differ, Core's rule holds. Read it per [Core rules](neon-audit/references/core-rules.md), only for a component the task uses.
- **Installed component sources and types** (Neon items on the Neon base) **and official docs:** actual components, props and theme extension APIs.

For functional layouts, the style means restrained, task-led composition and strong hierarchy. Immersive layouts may be colorful and expressive. It is a design direction, not a measurable 99% match or a dependency requirement. For React feature work, build on the Neon base with Neon registry items; Neon no longer themes CDS (Neon 2.0.0 removed it), so an app on CDS is offered a Rebuild on the Neon base. CSS-only work preserves its framework and styling tier; review-only work does not install components. Do not install a third-party design system, copy third-party assets, or replace Finnomena fonts with a third-party typeface.

## Design intent

A functional Finnomena screen should read like a wayfinding panel: ink on white, where the content is the only thing asking for attention. The rules in this contract and in the skills each follow from one of the ideas below. When a screen meets a case no rule names, design from the idea rather than from the nearest rule.

- **The interface is ink; color is content.** Chrome, controls and text stay navy, white and neutral. Color appears where it carries a meaning (a status, a chart category, a selection) or inside content such as an illustration or a photo. A tinted tile or a colored heading competes with that meaning, which is why the color roles are narrow.
- **Size and position make the hierarchy.** The answer to the employee's question is the largest, first-read thing; everything else steps down through the type roles. Weight, color and boxes are not used to shout, which is why a role carries its own weight and takes no weight utility beside it.
- **Depth is a step of surface.** A region separates from the page by a quiet neutral fill or a hairline, and an ink band can frame a page. Only a layer that really floats casts a shadow.
- **Few shapes, as shipped.** A screen takes its radii from the components it uses, so controls, containers and overlays each keep one shape. A new radius or border style needs a reason a user would notice.
- **Space first, lines second, boxes last.** Group with spacing; add a divider when spacing alone is ambiguous; add a container when the group is a thing the user acts on.
- **One next step.** Each screen or panel has one primary action, visible where its answer appears.

These ideas are for functional screens. On an immersive page the agent building it designs freely and at full ambition, and Neon supplies the color, from an Immersive Theme or a Reference Design, and the [Brand Floor](#reference-designs-and-brand-intensity).

### Fixed, and yours to design

This table is for functional screens. On a Campaign Page only the Immersive Theme's colors, the Brand Floor and scope are fixed; everything else is yours, per [campaign direction](neon-create/references/campaign-direction.md).

| Fixed | Yours to design |
| --- | --- |
| Tokens, type roles and the base's components with their props | Which composition serves the task: grouping, order, density, what is first-read |
| The color roles | Where content color goes: illustration, imagery, a chart |
| The app's shell: its navigation, panes and the layout components that supply them | Which of the shell's layouts the screen takes and what goes in each pane |
| Scope the request set: tier, composition, preserved behavior | Inside a pane, a layout, state or interaction no pattern here lists, built from the fixed column |
| Evidence rules for what a report may claim | Copy, empty states |

The shell is not edited, rebuilt or put together again from its parts for one screen: one of its layouts renders the screen. When none fits the task, take the nearest one, build what it lacks inside its panes, and say in the report which layout that is and what did not fit.

The task-based choices, functional patterns and examples below are defaults that solved earlier screens, not templates. A different composition that serves the task better and keeps the fixed column is welcome; say in the report what you chose and why, so a reviewer judges the choice and not its novelty.

## Color roles

| Role | Treatment | Current adapter guidance |
| --- | --- | --- |
| Structure and primary actions | Navy ink, white, quiet neutral surfaces | `bg`, `bgAlternate`, `fg`, `fgMuted`, `bgPrimary`; primary action maps to navy |
| Interaction highlight | Indigo for focus, selection and links | `bgLinePrimary` currently maps to focus indigo; inspect component types and contrast before reusing as text |
| Status and support | Success, warning, error or information only where that meaning exists | `fgPositive`, `fgNegative`, `bgPositiveWash`, `bgNegativeWash`, `bgWarning` and related semantic roles |
| Accent and illustration | Purposeful secondary color in supporting content | Existing `accent*` roles; yellow is optional. Immersive pages take accent and action from their Immersive Theme; Reference-led pages have no mandatory CTA color, palette pair or per-screen quota |
| Charts and categories | Stable, labeled category assignments | Preserve domain meaning and legends; don't recolor every series to navy/indigo |

Functional UI should read as navy/white with restrained indigo interaction signals. Do not make every card, heading, or action indigo, assign random colored dashboard tiles, or use status colors as generic decoration. Pair status color with text or an icon. Illustrations may use the supporting palette without determining the app chrome.

Current exported tokens still include black-alpha text, black dark surfaces, and a few color roles with no Core token, which keep their earlier values and are provisional. Preserve their traceable values; this direction does not authorize inventing a replacement navy ramp. Report a concrete mismatch when it affects the requested screen. An indigo border token is not automatically an accessible link color. Verify actual foreground/background combinations in the affected mode.

## Composition

Start from the employee's main task and the information needed to complete it. Use typography, alignment, whitespace and subtle dividers to establish hierarchy. Group related content with spacing first and a divider when spacing alone is ambiguous; use a container when the group is a thing the user acts on, such as an item in a collection or a card the request asks for. Avoid card-within-card treatment or decorative gradients as the default product scaffold.

**Functional screens:** prioritize scanning, comparison and action. Forms use clear labels, nearby help and validation. Tables suit dense comparisons; lists suit short summaries. A detail pane earns its space when users need to inspect and act on a selected record. Reuse the existing shell. Its sidebar is the app's menu: the destinations an employee moves between. A new Back Office or Product Feature app sits in the sidebar navigation unless the request says the product stands alone; never ship an empty sidebar. A Product Feature app starts from the starter's Finnomena sidebar with its screen active, as [scaffold](neon-create/references/scaffold.md) has it. A list of records is content, never sidebar. When the task is to pick one record and then read or act on it, take the layout that supplies a list pane and a detail pane from the start; do not take a simpler layout and fit the list somewhere else. In the starter, `AppShell` supplies list/detail emphasis, `ContentLayout` emphasizes the main content, `SimpleLayout` omits the inspector, and `MultiColumnLayout` supplies columns side by side that each scroll on their own: a board, or records compared in columns. These names are not guaranteed exports in an existing app.

On functional screens, which action is primary, secondary or tertiary, and how many primaries a screen or panel holds, are Core's [hierarchy rules](../core/hierarchy.md). Prefer list rows to cards for scanning, settings and record rows. Shadows mark only layers that float above the page. These rules shape new UI and `composition: 'adapt'`; preserve and colors-only work keep existing structure. Detail: [functional patterns](neon-audit/references/functional-patterns.md).

A request for an iOS, iPhone or Android screen is built at phone width with the same Neon items and color roles as web, Core's `iOS=False` look. The web has no real Liquid Glass, so do not imitate it or another iOS-only look, and do not restyle an item to seem native; say in the report that the screen uses the Android and web look.

A whole page reads the same way in every app: content answers the page's question, the inspector holds its action, and content is a stack of sections that each preview a collection. The page types and their region order are in [page anatomy](neon-audit/references/page-anatomy.md).

### Immersive color

**Immersive screens:** the agent designs the page first, with no layout rule from Neon, and theming then changes its color only: see [campaign direction](neon-create/references/campaign-direction.md). Color the page from one Immersive Theme unless its reference design is Reference-led. The [themes](../theme/immersive-themes.json) are Club (white canvas), Exclusive (yellow), Private (light grey) and Ultra (navy), from the Finnomena Guidelines v1 membership levels, and are provisional pending design owner review. On the Neon base, a page that uses `ImmersiveLayout` (optional) can pass the theme as `ImmersiveLayout`'s `immersiveTheme` (the `@neon/immersive-themes` registry item): it sets the attribute, takes buttons and other controls, focus ring, logo and `color-scheme` from the theme and lets the page scroll with the window, so `position: sticky` pins to the viewport. Elsewhere, copy the [generated theme CSS](../theme/css/immersive-themes.css) into the app and set `data-immersive-theme` on the page root. Color sections only with its `--immersive-*` properties: canvas and text; the theme's own `palette-100/75/50/25` steps; the `accent-*` steps (Ultra adds `support-*`); the guideline's secondary `green-*`, `blue-*`, `purple-*`, `red-*` and `orange-*` steps, shared by every theme for highlights, tags and illustration blocks, each with its `on-*` text color; and `action`/`on-action` for the main action. Let the theme's own colors lead, and keep secondaries away from data where green or red would read as status. On Exclusive, Private and Ultra `palette-100` is the canvas, so stepped blocks there start at 75. Changing that one prop or attribute switches theme, so an open direction can be shown as the themes and a review build can offer a theme toggle. Within a theme follow the guideline: text only in White or Navy, tints by step rather than opacity, one color family per background block (a section's ground; an illustration on it may mix families), and gradients only from the [Gradient Recipes](#gradients) (Neon's ADR 0014). Keep status colors semantic when communicating system feedback. A page with its own root sets the attribute itself. A Theme Brief is used only when the employee names or supplies one.

**Reference-led immersive pages** keep the thinner [Brand Floor](#reference-designs-and-brand-intensity) instead of a theme: they may keep just IBM Plex Sans Thai and a few Finnomena colors, navy/white need not dominate any section, and [palette-based gradients](#gradients) are allowed when they support the story. Choose action colors for each surface; navy, yellow and indigo are not mandatory hero or CTA colors. A white action suits dark or saturated surfaces, with a dark label. Scope such action colors to the page; the shared primary mapping stays navy for functional screens. A user-supplied reference design contributes only what its Brand Intensity allows; it never supersedes the Brand Floor.

## Gradients

Gradients belong on immersive surfaces, such as a hero field, a card or a section fading into the next: on Reference-led pages and on an Immersive Theme, where each stop is the theme's own `--immersive-*` step of that value, so a theme switch carries it. Functional scaffolding never uses one. Build them from these recipes. The recipes are provisional: they are derived from Finnomena campaign files, not design-approved. Keep them page-scoped, in the page's own styles, never in theme files or shared theme variables. Direction, angle and coverage are free.

| Recipe | Stops | Text at every stop | Seen in |
| --- | --- | --- | --- |
| Tint fade | One family, 100 or 75 → 25 of the same family, or → transparent into the next section | Navy, on Yellow, Light Grey, Green, Blue, Teal, Orange, Red or Magenta | Club card and footer fades |
| Navy depth | Navy/100 → Navy/75 | White | Club Ultra card |
| Field to navy | A family's 25 or 50 → Navy/100 | Placement-dependent | KKP hero |

Write each stop as its `theme/tokens/colors.json` hex, or as an existing theme variable with exactly that value, such as `accentBoldGray` for Navy/100. Any other color, including a near-palette tint from a design file, is a new brand value.

## Reference designs and Brand Intensity

A reference design is an outside style description (for example from Refero Styles) that the employee supplies for a campaign or landing page. Brand Intensity decides how much of it survives. It applies to campaign and landing pages only; functional screens use this contract and take at most section structure from a reference.

| Brand Intensity | Reference design keeps | Finnomena supplies |
| --- | --- | --- |
| Finnomena-led | Section structure and reading sequence | Everything else in this contract |
| Blended (default) | Also geometry (radius, spacing rhythm, shadow, type scale and weight) and motion | Palette, typeface, logo |
| Reference-led | Also its colors, such as a dark canvas, accents and action colors | Typeface, logo, at least one identifiable Finnomena color |

**Brand Floor**, kept at every level: the Finnomena logo, IBM Plex Sans Thai, at least one identifiable Finnomena color, and no source-brand logo, imagery, illustration, copy, product name or font file. Status colors stay semantic. Below Reference-led, a reference's accent color becomes the matching Finnomena role; an action may still be white or another neutral. Colors kept from a reference stay page-scoped and never become new values in the shared theme. A reference's gradient keeps its placement, direction and coverage wherever its geometry survives, while its stops become a [gradient recipe](#gradients); at Reference-led, a gradient made only of the reference's neutral surface colors may keep them.

## Task-based choices

These are decision aids for functional screens, not mandatory screen templates or approved visual exemplars. Reuse the app's current components before introducing a new layout abstraction.

| User task | Useful composition | Selection criterion |
| --- | --- | --- |
| Compare many records across the same attributes | Table with aligned columns and clear headers | Comparison benefits from shared column alignment; keep key columns/actions reachable on narrow screens |
| Scan short summaries and open one record | List with selected detail | Add a side panel only if simultaneous context helps the decision; otherwise a detail view with a return path is enough |
| Enter related information | Labeled form groups with nearby help/errors | Group by meaning; use multiple steps only when the task has a real sequence, not to decorate a short form |
| Filter a collection | Toolbar near results and a no-match state | Preserve query and selection semantics; let controls wrap/stack without hiding filtering on small screens |
| Understand a product or campaign | The agent's own design, then an Immersive Theme | No layout rule |

For existing screens, apply these decisions only within authorized composition changes. Colors-only and an ambiguous “make it Finnomena” request preserve structure. In `composition: 'adapt'`, improve hierarchy, grouping or responsive presentation without changing routes, handlers, services or data meaning.

## Typography, geometry and assets

Use IBM Plex Sans Thai via the app's font loader, with both Thai and Latin verified. On functional screens use Neon's type roles (`text-title1`, `text-body`, `text-label1` and the rest on the Neon base) and shipped spacing/radius tokens. A Campaign Page keeps the typeface and sets its own sizes, weights, spacing and radii. Structural widths and responsive geometry may use documented layout dimensions; do not prohibit every numeric CSS value. Preserve geometry during colors-only work.

On the Neon base and in the CSS adapter, each type role takes the size and line height of one Core text style; its numbers are in `<Neon root>/core/text-styles.json`. From `title1` down the line heights follow Core's Thai rule, 1.4 × the size rounded up to a multiple of 4, which Core worked out for Finnomena Trek. In IBM Plex Sans Thai that clears most wrapped Thai and not the worst stack: measured in Chromium, a deep vowel directly above a stacked tone mark overlaps by up to 2px from `title1` to `body`, and one wrapped sample touched by 1px at `headline` and `body`. So do not tighten a role's line height. `display1` to `display3` take Core's Display styles, whose line heights are tighter (1.1 to 1.2 × the size): wrapped Thai collides there wherever a vowel below one line meets a mark above the next, so look at a wrapped Thai display heading in the browser and loosen only one that collides. Family and weight stay Neon's: IBM Plex Sans Thai at the role's own weight.

| Type role | Core text style |
|---|---|
| `display1` | Display 1 |
| `display2` | Display 2 |
| `display3` | Display 3 |
| `title1` | Title 1 |
| `title2` | Title 2 |
| `title3` | Title 3 |
| `title4` | Title 3 |
| `headline` | Headline |
| `body` | Body |
| `label1` | Subheadline |
| `label2` | Subheadline |
| `caption` | Footnote |
| `legal` | Footnote |

Use the Finnomena logo SVGs in `theme/logo/` through a `Logo`: the Neon base's `@neon/logo` registry item. Select the mark for its actual surface. Do not recreate the wordmark as text. Existing apps reuse their approved assets.

## Feature states and narrow screens

Implement the states relevant to the task: loading, empty, error with recovery, validation, disabled/pending, success and selection, each reached through real conditions rather than a state switcher in the UI. Preserve entered data after recoverable failures. Reuse real service contracts. Mock data alone does not make an app a demo: ship a production-grade UI and report mocked behavior and missing integration in the delivery report. Label mock behavior in the UI only when the request asks for a demo, prototype or mock-labeled build. Do not invent authentication or persistence.

These rules are for functional screens; a Campaign Page takes only its [brand rules](neon-create/references/campaign-direction.md#what-every-page-keeps).

On narrow screens, retain the main task and a way to reach navigation/details. Stack or progressively reveal panels; do not simply hide essential actions. Allow long Thai/English labels to wrap. On narrow functional screens, a focused flow docks its primary action at the bottom without overlapping a tab bar, and a secondary task opens in the overlay [Core's rules](neon-audit/references/core-rules.md) give its content. Functional motion explains a change; no loops over 5 seconds or auto-advancing carousels. Check keyboard focus, control names, dialog focus return and reduced motion when applicable.

## Illustrative example: approvals

Show a scannable pending list and selected request details. Use navy for the main approval action, an indigo selection/focus indicator, and labeled semantic status badges. Approve and reject take their hierarchy from Core's [rules](../core/hierarchy.md): rejecting removes no data, so it is not a destructive action (rule 5). Include empty, pending, failure/retry and completion states. On a narrow screen, open details with an obvious way back to the list. Preserve the existing router, providers and approval service; a mock must not imply a real approval occurred.

## Illustrative example: immersive campaign

A product landing page on the Exclusive or Private theme takes whatever layout the agent designs, then that theme's canvas, palette and accent steps and navy action; on Ultra the same layout turns navy with a white action and a navy label. Do not carry an immersive composition into a dense approvals workspace by default.

## Illustrative example: responsive request form

Group requester information separately from request details, retain the current field names, validation and submit handler, and put errors near the affected field. Use a navy primary submit action and an indigo focus indicator. A narrow layout stacks existing groups in a meaningful reading order; it does not remove required fields. For colors-only work, change semantic colors while retaining the original groups and spacing. These examples are explanatory, not formal Finnomena design approval.
