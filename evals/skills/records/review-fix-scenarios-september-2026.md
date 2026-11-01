# Review-fix scenarios — September 2026

Run these as instruction walkthroughs or real host tasks, and record which method was used. Expected outcomes below are acceptance criteria, not completed test results.

| Request/context | Expected decisions |
| --- | --- |
| Monorepo contains two plausible React apps; `Assess Finnomena adoption` names neither | Inspect workspace candidates, ask which app; no theme installation or arbitrary target choice |
| Theme files exist but are not imported; `Assess whether Finnomena is already wired` | Trace entry/provider imports; report inactive files rather than claiming successful integration |
| `Review this screenshot; do not edit` | Visible findings only; keyboard behavior, other viewports and exact measured contrast remain unverified |
| `Review accessibility` with source only and no browser access | Report source-supported findings and runtime limitations; no invented interaction pass or dependency installation |
| `Adopt CDS in this React app` without global or icon styles | Inspect existing imports, add missing imports once at permitted entrypoint; build and inspect a real component/icon |
| `Change only this Vue header's colors in light and dark mode` | Use scoped canonical mode declarations; preserve geometry, fonts, services and non-header consumers; no CDS |
