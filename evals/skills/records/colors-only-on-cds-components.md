---
scenarios:
  - request: In an app already on CDS with a working Finnomena theme, "change the yellow CTA to a white button" on a CDS campaign page
    observe: Routes to `neon-create`, not `neon-redesign`; no installer or provider setup; changes that one Button through a CDS prop, configuration or a scoped wrapper; no app stylesheet rule reaches into the component (`stylesheet-scope.mjs`); `color-overrides.ts`, `theme.css`, `neonComponentConfig` and other Buttons unchanged; fonts, spacing, radius and composition unchanged; label and boundary contrast checked.
---

# Colors-only on CDS components

Request, verbatim, with no skill named: "change the yellow CTA to a white button". Context given: an existing React app with a working Finnomena CDS theme (`createNeonTheme()`, providers wired); a campaign page whose CTA is a CDS `Button` rendering yellow; no app source.

Before (`6c0a1f6`), secondhand: a fresh-agent walkthrough in the session that raised this case stayed on `neon-create`, but flagged that its "When to use" sends every colors-only restyle, React included, to `neon-redesign`, while `neon-redesign` works through CSS tokens and CDS integration says app CSS reaching into a CDS component overrides it unpredictably. The rule now decides by what renders the target: CSS-styled UI goes to `neon-redesign`, CDS components in an app already on CDS (frozen, per ADR 0006) stay in `neon-create` with colors-only scope.

After, one Claude `general-purpose` agent, decision only, told not to edit and not told the candidates or the tension. It picked `neon-create`, quoting the new When to use line, took the fast path, and read `neon-create/SKILL.md`, `INSTRUCTION.md` and the shared checklist, skipping CDS integration because the theme and providers do not change. Plan: find why the Button is yellow, check the installed Button prop types, change that one Button through a verified prop or a scoped wrapper with semantic keys, leave the theme files, providers and other Buttons alone, keep colors-only scope, report a white-on-light boundary problem rather than restyle around it, then run the checklist and the probe's report line. Verdict: pass for routing, scope and resource retrieval.

It flagged that "not app CSS" read against step 3's "scoped wrappers"; the line now says "not app stylesheet rules on the component". Left open: what to do when no Button prop gives a white fill (it suspected `secondary` is grey without checking the types), whether the shared checklist's restyling additions apply to a recolor in `neon-create`, which semantic role a white CTA takes, and that no skill file points to `token-lookup.mjs` or `contrast.mjs`.

Limits: one sample, Claude only, decision only with no app built or rendered, and the agent saw a worktree's skills, not the installed package. The sample ran on `6c0a1f6`, before the thin Brand Floor and ADR 0006 reached main; the later rewordings ("not app stylesheet rules on the component", "already on CDS (frozen)") were not re-sampled. Whether a white CTA is on-brand is the [reference design evaluation](reference-design-evaluation.md)'s case, not judged here.
