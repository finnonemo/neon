# Contributing to Neon

## Make a focused change

Describe the employee request that fails today and the expected behavior. Reproduce it before changing guidance. For skills, test retrieval and decisions with realistic prompts; for installer/packager code, use executable regression tests. Keep the same prompt and evidence for the before/after comparison.

Edit the owning source: visual decisions in `skills/INSTRUCTION.md`, mechanics in skill references, token data in `theme/tokens/`, CDS mapping in `theme/cds/color-overrides.ts`, and starter wiring in `templates/vitejs-cds/`. Reference-design and Brand Intensity rules apply to campaign and landing pages only and must not override functional product guidance. Use the terms in [GLOSSARY.md](GLOSSARY.md) and record hard-to-reverse decisions in [docs/adr/](docs/adr/).

Use a branch such as `codex/describe-the-change` and a focused pull request. Do not change release versions or publish as a side effect of a documentation refactor.

## Validate

Run from the repository root:

```sh
node --test evals/skills/*.test.mjs
node scripts/check-repository.mjs
git diff --check
```

The resource check follows local Markdown links and plugin-root paths in distributed skills, checks required skill metadata, and repeats against a newly packaged artifact. The packager rejects missing required top-level payloads. These checks do not validate every CDS API example or enforce design taste.

When raw tokens change, inspect generator headers and run in order:

```sh
node theme/scripts/sync-tokens.mjs
node theme/scripts/generate-theme-config.mjs
node theme/scripts/generate-breakpoints-config.mjs
```

Review the resulting diff and unresolved-token report. Color mapping is hand-maintained; the CSS adapter must be updated separately using the method in its header. Do not automatically replace missing mappings with guesses.

For template, theme or component changes, assemble a fresh disposable app, install dependencies with its package manager, build it and inspect the affected UI. Check relevant light/dark modes, narrow/wide layouts, Thai/English labels, keyboard interactions and task states. Record actual evidence, including blocked checks.

For skill changes, compare baseline/revised decisions and representative app behavior; word count alone is not a quality metric. Read only task-relevant references during evaluation and record actual questions, setup actions and files read. Use [evals/skills/README.md](evals/skills/README.md). A read-through can verify retrieval/routing; only implemented and rendered apps support claims about visual output improvement.

## Review and release

A pull request should state the original problem, resulting employee behavior, validation performed, and material limitations. Include before/after evidence for a visual change. A design owner should review mapping changes; do not label a provisional mapping approved without that review.

Before a release, package into an empty destination and repeat resource checks, verify an installed-host smoke scenario, and review relevant generated UI. Keep host installation, browser checks and design approval marked unverified until actually performed. The CI workflow validates pull requests; it neither publishes a plugin nor changes branch protection. Maintainers can make the `validate` job required in repository settings.

For real visual references, use [the example-library workflow](docs/design/example-library.md). Keep illustrative examples, behavioral fixtures and explicitly reviewed design references distinct.
