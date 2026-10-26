---
name: neon-redesign
description: Use when restyling existing Finnomena or neon UI through CSS tokens without adopting CDS, including non-React apps, partial changes, pages restyled from a supplied reference design and explicitly requested layout or hierarchy redesign. Applies to established Finnomena intent. Use neon-create for CDS adoption.
---

# Restyle Finnomena UI

## Purpose

Apply Finnomena visual roles to existing UI while preserving its framework and product behavior. Support requested composition changes separately from color/typography scope.

## When to use

Use for CSS styling or presentation redesign. Full CDS adoption belongs to [neon-create](../neon-create/SKILL.md). Review-only requests belong to [neon-review](../neon-review/SKILL.md).

## Fast path

When target, scope and theme variables are known, begin with the affected styles. Reuse available tokens; skip installation and audit. A header-only request stays local, including variable declarations.

## Workflow

1. Establish scope from the request and existing context. `colors` changes only colors; `visual-system` also covers brand typography, spacing and radius. Existing composition defaults to `preserve`; set `adapt` only for an explicit layout/hierarchy request. Conflicting instructions require clarification. Read the [shared contract](../neon-audit/references/workflow-contract.md) only if these decisions remain unresolved.
2. Inventory the affected styles and shared consumers. Record existing behavior and a before view. Resolve Neon resources two levels above this skill's real directory; use the [design contract](../INSTRUCTION.md) for the relevant visual roles.
3. Map by meaning: primary action, selection, status and chart category are different jobs even if they share a hex value. Reuse matching tokens; preserve domain color meaning. Do not use a global replacement for a local request. Tailwind target (config, `@theme` or stock utilities such as `bg-slate-900`): read the [Tailwind mapping rules](references/style-migration.md#tailwind-mapping-rules) and the matching format section before mapping, including on the fast path.
4. Update scoped tokens, then remaining component styles. For `adapt`, reorganize presentation within the named scope while retaining routes, handlers, service contracts, data meaning and access to essential actions. Do not adopt a new framework or component library to rearrange a page.
5. Verify with the [shared checklist](references/verification.md), including before/after appearance, preserved behavior and unrelated consumers for partial changes.

## Conditional references

- Plain CSS/shadcn formats or mapping examples: relevant sections of [style migration](references/style-migration.md).
- Any supplied reference design or outside style file: [reference design](../neon-audit/references/reference-design.md).
- Missing CSS asset: [CSS setup](references/css-integration.md#css-setup); whole-app installation differs from a local override.
- Typography expansion: [fonts](../neon-audit/references/theme-integration.md#font-loading). Reusing the asset still requires font loading and layout checks.
- Mode selectors, CSS-to-CDS upgrade or customized-file conflict: relevant sections of [theme integration](../neon-audit/references/theme-integration.md).
- CSS adapter gaps or regeneration: [adapter limits](references/css-integration.md#adapter-limits).

## Done

Report changed scope/tokens, observed visual and behavior checks, and exceptions or unavailable checks. Color mapping is provisional; identify relevant discrepancies without inventing replacement brand values. Read-only review is a separate task, not a mandatory extra gate.
