---
name: neon-audit
description: Use when a Finnomena or neon project's target or theme integration approach is unclear, or when explicitly asked to assess adoption options. Known feature, restyle and review requests can go directly to their implementation or review skill.
---

# Choose a Finnomena integration path

## Purpose

Resolve an unclear target or theming decision through a short, read-only inspection, then recommend one path. This is not a UI quality review or a full source audit.

## When to use

Use for unresolved integration choices or explicit assessment requests. Brand intent must come from the request, established context or project instructions; an installed component library alone is not enough.

## Fast path

Review requests go directly to [neon-review](../neon-review/SKILL.md). New React apps, and features in an app on the Neon base or already on CDS, go to [neon-create](../neon-create/SKILL.md). Explicit CSS-only restyles go to [neon-redesign](../neon-redesign/SKILL.md). Do not reopen settled choices because a theme file exists.

## Workflow

1. Reuse known target and scope. If routing is unsettled, read the [shared contract](references/workflow-contract.md). Resolve the Neon root from this skill's real directory, two levels up; never from the target app's working directory.
2. Inspect only missing evidence: target manifest/lockfile and the app's [base](references/project-inspection.md#base), relevant entry/theme/provider usage, styling mechanism and local/shared consumers. Read source, not generated/vendor files. A dependency alone does not prove active wiring.
3. Apply explicit scope first. Non-React stays on the CSS path. An app keeps its base: a new React app starts on the Neon base, an app already on CDS stays on CDS (the CDS Install mode is deprecated and Neon 2.0.0 removes it, so offer a Rebuild on the Neon base with the recommendation), and plain shadcn takes `@neon/` items only for requested components. Existing working theme/providers are reused. Recommend one approach with a short reason.
4. Ask one focused question only if the app target is unresolved or a material adoption/scope choice remains. Do not offer a React base for non-React, or CDS to an app not already on it, ask an automatic upgrade question, or request approval for an obvious reuse decision.
5. Pass target, base, tier, preserved behavior and useful evidence to the chosen skill. If the request was assessment-only, stop with the recommendation instead of starting edits.

## Conditional references

Read only the relevant section of [project inspection](references/project-inspection.md): [multiple apps](references/project-inspection.md#multiple-apps), [framework and dependencies](references/project-inspection.md#framework-and-dependencies), [base](references/project-inspection.md#base), [existing theme](references/project-inspection.md#existing-theme), [SSR](references/project-inspection.md#server-rendered-react), or [partial scope](references/project-inspection.md#partial-scope). Do not load the design guide merely to identify a framework.

Reporting which of the app's components have a Counterpart: [Counterpart coverage](references/core-rules.md#counterpart-coverage), from the index alone.

## Done

Return the recommended path and rationale, the app's base, preserved scope, and any unresolved choice. Where the app has a `src/components/ui/`, say which of its components have a Counterpart. Say what the path fixes (base, tier, preserved behavior) and what it leaves to the implementing skill to design, so a narrow recommendation is not read as a layout brief. State what was inspected; do not imply an exhaustive hardcoded-style scan. Continue the authorized implementation through the selected skill without repeating onboarding.
