# Finnomena product design contract

This is the shared visual direction for Neon feature building, based on the maintainer's September 2026 brief. It defines intended usage; it does not claim design approval of the provisional CDS mapping.

## Ownership

- **User brief:** product behavior, audience, content, scope, and explicit exceptions.
- **This contract:** Finnomena visual language and semantic color usage.
- **theme/tokens/:** exported foundation values. **theme/cds/color-overrides.ts:** provisional mapping to CDS roles; **theme/cds/theme.config.ts:** generated spacing, radius and typography. **theme/css/theme.css:** CSS adapter.
- **Installed @coinbase/cds-web types and official docs:** actual components, props and theme extension APIs.

For functional layouts, the style means restrained, task-led composition and strong hierarchy. Immersive layouts may be colorful and expressive. It is a design direction, not a measurable 99% match or a dependency requirement. For React/CDS feature work, implement with CDS. CSS-only work preserves its framework and styling tier; review-only work does not install components. Do not install a third-party design system, copy third-party assets, or replace Finnomena fonts with a third-party typeface.

## Color roles

| Role | Treatment | Current adapter guidance |
| --- | --- | --- |
| Structure and primary actions | Navy ink, white, quiet neutral surfaces | `bg`, `bgAlternate`, `fg`, `fgMuted`, `bgPrimary`; primary action maps to navy |
| Interaction highlight | Indigo for focus, selection and links | `bgLinePrimary` currently maps to focus indigo; inspect component types and contrast before reusing as text |
| Status and support | Success, warning, error or information only where that meaning exists | `fgPositive`, `fgNegative`, `bgPositiveWash`, `bgNegativeWash`, `bgWarning` and related semantic roles |
| Accent and illustration | Purposeful secondary color in supporting content | Existing `accent*` roles; yellow is optional; can be prominent on immersive pages, with no mandatory CTA color or per-screen quota |
| Charts and categories | Stable, labeled category assignments | Preserve domain meaning and legends; don't recolor every series to navy/indigo |

Functional UI should read as navy/white with restrained indigo interaction signals. Do not make every card, heading, or action indigo, assign random colored dashboard tiles, or use status colors as generic decoration. Pair status color with text or an icon. Illustrations may use the supporting palette without determining the app chrome.

Current exported tokens still include black-alpha text, black dark surfaces, and inherited CDS fallback slots. Preserve their traceable values; this direction does not authorize inventing a replacement navy ramp. Report a concrete mismatch when it affects the requested screen. An indigo border token is not automatically an accessible link color. Verify actual foreground/background combinations in the affected mode.

## Composition

Start from the employee's main task and the information needed to complete it. Use typography, alignment, whitespace and subtle dividers to establish hierarchy. Use containers when they group related content; avoid card-within-card treatment or decorative gradients as the default product scaffold.

**Functional screens:** prioritize scanning, comparison and action. Forms use clear labels, nearby help and validation. Tables suit dense comparisons; lists suit short summaries. A detail pane earns its space when users need to inspect and act on a selected record. Reuse the existing shell. In the starter, `AppShell` supplies list/detail emphasis, `ContentLayout` emphasizes the main content, `SimpleLayout` omits the inspector, and `MultiColumnLayout` is for explicit board workflows. These names are not guaranteed exports in an existing app.

**Immersive screens:** colorful Finnomena surfaces, expressive illustrations and palette-based gradients are allowed when they support the story. Navy/white need not dominate every section. Use a focused reading sequence, clear proposition, relevant imagery and an identifiable next action. Choose accessible action colors for each surface; indigo is not a mandatory hero or CTA color. Keep status colors semantic when communicating system feedback. `ImmersiveLayout` is a starter option, not a mandatory landing-page recipe. User-supplied reference designs can inform composition when selected and available; their source-brand colors do not supersede this contract.

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

Implement the states relevant to the task: loading, empty, error with recovery, validation, disabled/pending, success and selection, driven by real conditions — never a manual state-switcher shipped in the UI. Preserve entered data after recoverable failures. Reuse real service contracts. Needing mock data before a real backend exists does not by itself make an app "a demo": default to a production-grade UI with no visible demo/mock disclaimer banner or tag. Add one only when the user's own request explicitly asks for a demo, prototype or mock-labeled build; otherwise disclose mocked or missing-integration status in the delivery report, not the shipped UI. Do not invent authentication or persistence.

On narrow screens, retain the main task and a way to reach navigation/details. Stack or progressively reveal panels; do not simply hide essential actions. Allow long Thai/English labels to wrap. Check keyboard focus, control names, dialog focus return and reduced motion when applicable.

## Illustrative example: approvals

Show a scannable pending list and selected request details. Use navy for the main approval action, an indigo selection/focus indicator, and labeled semantic status badges. A reject action uses the appropriate destructive treatment. Include empty, pending, failure/retry and completion states. On a narrow screen, open details with an obvious way back to the list. Preserve the existing router, providers and approval service; a mock must not imply a real approval occurred.

## Illustrative example: immersive campaign

A product landing page may use a substantial yellow or blue-grey hero field, colorful Finnomena illustrations and alternating light/navy sections. Choose a contrasting navy action on a light accent surface. Keep navigation, forms and status feedback legible and familiar. This expressive composition is appropriate for an immersive story; do not carry its decorative panels into a dense approvals workspace by default.

## Illustrative example: responsive request form

Group requester information separately from request details, retain the current field names, validation and submit handler, and put errors near the affected field. Use a navy primary submit action and an indigo focus indicator. A narrow layout stacks existing groups in a meaningful reading order; it does not remove required fields. For colors-only work, change semantic colors while retaining the original groups and spacing. These examples are explanatory, not formal Finnomena design approval.
