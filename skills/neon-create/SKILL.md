---
name: neon-create
description: Use when building Finnomena or neon features, screens, components, landing pages or new React apps with Coinbase Design System, including pages styled from a supplied reference design; rebuilding an existing React app on CDS; or integrating its theme into React. Applies to established Finnomena intent. Use neon-redesign for CSS-only styling and neon-review for review-only requests.
---

# Build Finnomena features with CDS

## Purpose

Deliver the requested content and interactions with real `@coinbase/cds-web` components and Finnomena tokens. Functional screens use restrained navy/white and indigo highlights; immersive pages can be colorful.

## When to use

Use for React/CDS implementation. A colors-only or CSS-only restyle, React apps included, follows [neon-redesign](../neon-redesign/SKILL.md) instead, with its mapping references. Preserve an explicitly requested non-React framework and use its normal feature workflow plus Neon's CSS styling path. A request to review does not authorize implementation.

## Fast path

If the app already has a working Finnomena CDS theme, start with the requested component, service and interaction. Reuse its shell, providers, routes and customized theme; skip scaffold, installer and provider setup. Reuse established scope without another tier question.

## Workflow

1. Identify the target, main task and relevant states. Inspect only missing app evidence. Use the [shared contract](../neon-audit/references/workflow-contract.md) if scope/routing is unresolved; conflicting preserve/change instructions require clarification. Resolve Neon resources two levels above this skill's real directory.
2. Read the relevant [design guidance](../INSTRUCTION.md#composition) for visual choices. Select functional or immersive independently of framework. In existing UI preserve composition unless change is requested. When an immersive page's direction is still open (a mood word, "this style", a reference image with no stated target) or a built direction was rejected, show 2–3 distinct directions as cheap static mockups (Immersive Themes by default) and build only the one the employee picks. A themed page colors only through `--immersive-*`, and its review build gets a visible theme toggle so the employee can switch themes.
3. Build with existing services and verified CDS exports/prop types. Use semantic color, spacing and radius keys; configure component-specific treatment through supported configuration or scoped wrappers. Do not invent imports, tokens or backend behavior.
4. Implement task-relevant loading, empty, validation, pending, error/recovery and success states, reached through real conditions. Report mocked behavior in the Done summary; label it in the UI only when the request asks for a demo. A starter alone is not a feature.
5. Run the [shared verification](../neon-redesign/references/verification.md), applying only relevant additions. Inspect actual output; report unavailable checks rather than claiming them.

## Conditional references

- New project: [scaffold and layout](references/scaffold.md). Never scaffold over a nonempty app.
- Explicit rebuild of an existing React app on CDS: [rebuild](references/rebuild.md), into a new directory.
- Any supplied reference design or outside style file: [reference design](../neon-audit/references/reference-design.md).
- Theme/provider/dependency changes: [CDS integration](references/cds-integration.md). Preserve customized files and theme-mode ownership.
- Complex feature states or existing-app integration: [new UI workflow](references/new-ui-workflow.md).
- Font, mode, migration or installer conflict: the matching section of [theme integration](../neon-audit/references/theme-integration.md).

## Done

Deliver working requested UI, its location/preview, checks performed and material limitations. State Ship-ready or Brand-ready per [readiness and handoff](../neon-audit/references/readiness.md), with a Handoff Summary for Brand-ready work. Keep provisional mapping, mocked services and unverified runtime behavior distinct from confirmed results.
