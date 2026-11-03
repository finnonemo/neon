# Contributing to Neon

## Make a focused change

Describe the employee request that fails today and the expected behavior. Reproduce it before changing guidance. For skills, test retrieval and decisions with realistic prompts; for installer/packager code, use executable regression tests. Keep the same prompt and evidence for the before/after comparison.

Edit the owning source: visual decisions in `skills/INSTRUCTION.md`, mechanics in skill references, token data in `theme/tokens/`, and the Neon base's components, layouts and slot mapping in `registry/`. CDS is frozen: `theme/cds/` and `templates/vitejs-cds/` take bug fixes only, for apps already on CDS. Reference-design and Brand Intensity rules apply to campaign and landing pages only and must not override functional product guidance. Use the terms in [GLOSSARY.md](GLOSSARY.md) and record hard-to-reverse decisions as ADRs in [docs/adr](docs/adr/).

Use a branch such as `codex/describe-the-change` and a focused pull request. Do not change release versions or publish as a side effect of a documentation refactor.

## Validate

Run from the repository root:

```sh
node scripts/validate.mjs
git diff --check
```

The resource check follows local Markdown links and plugin-root paths in distributed skills, parses skill frontmatter strictly (an unquoted `: ` or ` #` in a plain `description` is rejected, and descriptions are limited to 1024 characters), rejects shipped Markdown that is not UTF-8 or contains double-encoded (mojibake) text, and repeats against a newly packaged artifact. It also checks plain-text file references (bare Markdown filenames, backticked top-level directories, `../` paths and repository paths with an extension) in all Markdown and in code comments under `theme/` and `scripts/`, excluding `templates/`, `theme/examples/` and ignored paths. The packager rejects missing required top-level payloads. These checks do not validate every CDS API example or enforce design taste.

When raw tokens change, inspect generator headers and run in order:

```sh
node theme/scripts/sync-tokens.mjs
node theme/scripts/generate-theme-config.mjs
node theme/scripts/generate-breakpoints-config.mjs
```

Review the resulting diff and unresolved-token report. Color mapping is hand-maintained; the CSS adapter must be updated separately using the method in its header. Do not automatically replace missing mappings with guesses. Before naming the Neon registry items a token change affects, list them with `node scripts/registry-consumers.mjs <token>`.

The registry's built items in `registry/r/` carry a copy of every file they install, the CSS adapter included. After changing `registry/` or a file an item copies, rebuild them with `node scripts/build-registry.mjs`; `validate` fails on a stale build.

For registry, template or theme changes, run `node scripts/smoke-new-app.mjs`. It builds the registry, serves it locally, creates an app with the New install mode, adds an item and a Theme Brief with Add, and builds the app, once outside any repository and once under `.local/smoke/`. Then inspect the affected UI. Check relevant light/dark modes, narrow/wide layouts, Thai/English labels, keyboard interactions and task states. Record actual evidence, including blocked checks.

For registry and starter changes, also run the [browser suite](evals/templates/README.md) with `--target neon`, which creates the app from the registry and holds it to the CDS baseline. A fix to the frozen CDS starter or CDS theme files runs the default CDS target. Both leave reports under `.local/evals/templates/`; CI runs both targets and uploads the reports separately from the plugin.

For changes to the browser probe, its runner or their fixtures, check on Linux before calling them done, not only on macOS. CI runs the browser job in `mcr.microsoft.com/playwright` with Linux Chrome and without macOS system fonts. Process cleanup, Chrome's temporary files and font fallbacks behaved differently there and failed CI twice after local runs passed. Use the image tag `template-browser.yml` names, or push early and read the CI result.

For skill changes, compare baseline/revised decisions and representative app behavior; word count alone is not a quality metric. Read only task-relevant references during evaluation and record actual questions, setup actions and files read. Use [evals/skills/README.md](evals/skills/README.md). A read-through can verify retrieval/routing; only implemented and rendered apps support claims about visual output improvement.

## Review and release

A pull request should state the original problem, resulting employee behavior, validation performed, and material limitations. Reviewers apply [CODING_STANDARDS.md](CODING_STANDARDS.md), including its rule for evidence claims in pull requests and eval records. Include before/after evidence for a visual change. A design owner should review mapping changes; do not label a provisional mapping approved without that review.

Before a release, package into an empty destination and repeat resource checks, verify an installed-host smoke scenario, and review relevant generated UI. Skills install registry items from raw files at the release tag, so a release also pins the registry: set the version in `.claude-plugin/plugin.json`, rebuild `registry/r/` so every item URL names `neon--v<version>`, and push that tag with the release. Until the tag exists, the pinned item URLs return 404. Keep host installation, browser checks and design approval marked unverified until actually performed. CI validates pull requests and merge groups with two workflows. `validate.yml` always runs: it lints every workflow with a pinned, checksum-verified `actionlint`, then runs `node scripts/validate.mjs`. `template-browser.yml` always reports, but its browser job runs only when the registry, starter, theme, browser suite, assembler, browser probe or a file its scripts load changes; otherwise it is skipped, which a required check counts as passing. Neither publishes a plugin or changes branch protection. Branch protection on `main` requires `validate` and an up-to-date branch, so merge `main` into a pull request branch that falls behind before merging it, or add it to the merge queue where one is enabled. It requires no review, so a pull request GitHub shows as BLOCKED is waiting on `validate`, not on a reviewer. The browser path list and the rule that any doubt runs the browser job live once, in `.github/scripts/browser-changes.mjs`, which `evals/skills/browser-changes.test.mjs` exercises against a temporary repository.

For real visual references, use [the example-library workflow](docs/design/example-library.md). To author or change a Theme Brief, its presets or picks files, follow [the Theme Brief write-up](docs/design/theme-briefs.md). Keep illustrative examples, behavioral fixtures and explicitly reviewed design references distinct.
