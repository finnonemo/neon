---
name: neon-create
description: Use when building Finnomena or neon features, screens, components, landing pages or new React apps on the Neon base (shadcn/ui matched to Core, from the Neon registry), including pages styled from a supplied reference design; rebuilding an existing React app on the Neon base; building in a React app already on Coinbase Design System (CDS); or integrating Neon's theme into React. Applies to established Finnomena intent. Use neon-redesign for CSS-only styling and neon-review for review-only requests.
---

# Build Finnomena features on the Neon base

## Purpose

Deliver the requested content and interactions with real components and Finnomena tokens: Neon registry items (`@neon/<item>`) in a new or Neon-base app, CDS components in an app already on CDS. One app never mixes the two. Functional screens use restrained navy/white and indigo highlights; immersive pages can be colorful.

## When to use

Use for React implementation. What renders the target decides colors-only work, not which base is installed: a colors-only or CSS-only restyle of CSS-styled UI, React apps included, follows [neon-redesign](../neon-redesign/SKILL.md) instead, with its mapping references; a color change to CDS components in an app already on CDS (frozen) stays here, keeps colors-only scope and goes through CDS props, configuration or a scoped wrapper (step 3), not app stylesheet rules on the component. Preserve an explicitly requested non-React framework and use its normal feature workflow plus Neon's CSS styling path. A request to review does not authorize implementation.

## Fast path

If the app already has a working Finnomena theme, on the Neon base or already on CDS, start with the requested component, service and interaction. Reuse its shell, providers, routes and customized theme; skip scaffold, theme installation and provider setup, not verification. Reuse established scope without another tier question.

## Workflow

1. Identify the target, main task and relevant states. Inspect only missing app evidence. Use the [shared contract](../neon-audit/references/workflow-contract.md) if scope/routing is unresolved; conflicting preserve/change instructions require clarification. Resolve Neon resources two levels above this skill's real directory. Tell the base from the app: `@coinbase/cds-web` is CDS, frozen for apps already on it; a `components.json` is shadcn, which takes `@neon/` items, and its `@neon` registry entry marks the Neon base; a new app starts on the Neon base. The CDS Install mode is deprecated and Neon 2.0.0 removes it: in an app already on CDS, do the requested work on CDS, then say so once in the report and offer a [Rebuild](references/rebuild.md) on the Neon base.
2. Read the [design intent](../INSTRUCTION.md#design-intent) and the relevant [composition guidance](../INSTRUCTION.md#composition) for visual choices. Select functional or immersive independently of framework. In existing UI preserve composition unless change is requested. When an immersive page's direction is still open (a mood word, "this style", a reference image with no stated target) or a built direction was rejected, show 2–3 distinct directions as cheap static mockups (Immersive Themes by default) and build only the one the employee picks. A themed page colors only through `--immersive-*`, and its review build gets a visible theme toggle so the employee can switch themes.
   - **Design thesis.** For new UI, before you write the first component file, write the design to `./NEON-HANDOFF.md` at the project root under a `## Design thesis` heading (create the file, or add the heading to an existing one; the [Handoff Summary](../neon-audit/references/readiness.md#handoff-summary) joins it later), in this shape, one line each: `Design thesis: answers <the user's question>` / `First-read: <the element>` / `Regions separate by: <space, hairline or surface step>` / `Color: <where it appears and why>` / `Designed here: <what no listed pattern covers, or nothing>`. It is the decision the build follows, not a formality: a screen built without one tends to repeat the last screen. A Campaign Page on an Immersive Theme adds the [direction lines](references/campaign-direction.md#direction-lines). Build to it, and in step 5 check the screenshots against it.
3. Build with existing services and the base's own components. On the Neon base use verified `@neon/` items, adding a missing one through the installer, never a stock shadcn item or CDS. In an app already on CDS use verified CDS exports and prop types, never a Neon or shadcn item. Use semantic color, type, spacing and radius roles; give component-specific treatment through props, supported configuration or scoped wrappers. Do not invent imports, tokens or backend behavior.
4. Implement task-relevant loading, empty, validation, pending, error/recovery and success states, reached through real conditions. Report mocked behavior in the Done summary; label it in the UI only when the request asks for a demo. A starter alone is not a feature.
5. Before reporting, read the [shared checklist](../neon-redesign/references/verification.md) and apply it with its relevant additions, including on the fast path, then run its [Look and fix](../neon-redesign/references/verification.md#look-and-fix) loop on your own screenshots. Inspect actual output; report unavailable checks rather than claiming them.

## Conditional references

- New project: [scaffold and layout](references/scaffold.md). Never scaffold over a nonempty app.
- Explicit rebuild of an existing React app: [rebuild](references/rebuild.md), into a new directory on the Neon base.
- Components, styling or an added item in a new, Neon-base or shadcn app: [Neon base](references/neon-base.md).
- About to choose a Neon item or one of its prop values (which component fits, its hierarchy, states or usage): [Core rules](../neon-audit/references/core-rules.md), for that item's Core doc only. Colors-only work reads none.
- A Campaign Page with no Reference Design, or a file headed `… — Theme Brief`: [Theme Briefs](references/theme-brief.md).
- Any supplied reference design or outside style file that is not a recognised Theme Brief: [reference design](../neon-audit/references/reference-design.md).
- Writing sections for a new or rebuilt Campaign Page: [campaign content](references/campaign-content.md).
- Composing a new or rebuilt Campaign Page on an Immersive Theme, its motion, or a note that it looks plain: [campaign direction](references/campaign-direction.md).
- Components, theme, provider or dependency changes in an app already on CDS: [CDS integration](references/cds-integration.md). Preserve customized files and theme-mode ownership.
- Complex feature states, mock figures or a comparison table on a functional screen, or existing-app integration: [new UI workflow](references/new-ui-workflow.md).
- New or adapted functional screen with lists, overlays, mobile actions or empty states: [functional patterns](../neon-audit/references/functional-patterns.md).
- A whole new functional page in an app with a shell (which layout, what each pane holds, the order of its regions): [page anatomy](../neon-audit/references/page-anatomy.md).
- Font, mode, migration or installer conflict: the matching section of [theme integration](../neon-audit/references/theme-integration.md).

## Done

Deliver working requested UI, its location/preview, checks performed and material limitations, as item 5 of the [shared checklist](../neon-redesign/references/verification.md#shared-checklist) asks, with each [Look and fix](../neon-redesign/references/verification.md#look-and-fix) round or its not-run line. For new UI, repeat the design thesis lines from `./NEON-HANDOFF.md` and say where the build departed from them and why, leaving the file's lines as first written; if you wrote them after building, say that instead of presenting them as written before. State Ship-ready or Brand-ready per [readiness and handoff](../neon-audit/references/readiness.md), with a Handoff Summary for Brand-ready work. Name every `@neon/` item the work added, in the Handoff Summary when there is one. Keep what is provisional (an Immersive Theme, a gradient recipe, a color role with no Core token, the color mapping of an app already on CDS), mocked services and unverified runtime behavior distinct from confirmed results.
