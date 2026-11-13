---
name: neon-review
description: Use when reviewing Finnomena or neon UI for task usability, branding, responsiveness or accessibility, including screenshots and source-only evidence. Applies to explicit invocation and established Finnomena context. Use neon-audit for uncertain theme adoption choices.
---

# Review Finnomena UI

## Purpose

Find actionable UI problems supported by evidence. Prioritize blocked user tasks and inaccessible essential controls before minor visual inconsistencies.

## When to use

Use for existing UI in any framework. Review-only is read-only; it does not install a theme, edit the app or start an implementation handoff.

## Fast path

Start from the supplied screenshot, source or URL and known scope. No tier selection or repeated branding question is needed. Ask for a target only when none is inspectable.

## Workflow

1. Select the evidence path:

   | Evidence | Inspect | Do not infer |
   | --- | --- | --- |
   | Screenshot | Visible hierarchy, clipping, labels, color roles and captured state | Keyboard behavior, other widths, exact font loading or measured contrast |
   | Source | Verified tokens, markup, handlers and declarations | Computed cascade or successful runtime interactions |
   | Live UI | Observed layout, focus, navigation and safely reachable states | Untested routes, unavailable states or backend correctness |

2. Identify the user's main task and inspect obstacles within the requested scope. Colors-only excludes typography/layout; header-only excludes unrelated screens. Combine evidence where available and label supplied versus independently observed results.
3. Where source is available, tell the app's [base](../neon-audit/references/project-inspection.md#base) from its manifests and apply that base's [checks](references/review-checks.md#checks-by-base). For brand judgments, read the relevant [design contract](../INSTRUCTION.md) sections. Resolve resources from this skill's real directory, not the app directory. Distinguish documented mismatches from taste; missing references limit brand conclusions.
4. Verify each suspected issue. Use the existing preview or a reviewed local start command. Do not install dependencies or edit configuration to enable a review. Do not submit, approve, purchase, delete or alter real records to reach a state; use authorized disposable data or mark it untested.
5. Report evidence with observed location and viewport/theme/state where available. Never invent measurements, source lines, compliance or verification coverage. Missing evidence is not proof of a defect.

## Conditional references

Use [review checks](references/review-checks.md) for the requested dimensions, and [color mapping](../../theme/cds/color-overrides.ts) only for disputed CDS assignments. Source-only risks remain hypotheses until reproduced.

A finding about how a component is used (which one, its hierarchy, a state): [Core rules](../neon-audit/references/core-rules.md), for the doc of that component only.

## Done

Return **Coverage**, **Findings**, and **Unverified**. Each finding states severity, location, evidence, who is affected and how, suggested fix and recheck; a finding on a component names the Core rule it breaks. Group repeated causes. High blocks the main task or an essential control; Medium materially harms usability/brand; Low is a minor inconsistency. No supported findings means none in the inspected scope, not whole-app certification.

Stop for review-only. If fixes are already requested, continue them with preserved scope after reporting findings; honor an explicit approval gate but do not invent one. Routine accessibility fixes use the app's repair workflow without forcing theme adoption.
