# Contributing to Neon

## Make a focused change

Describe the employee request that fails today and the expected behavior. Reproduce it before changing guidance. For skills, test retrieval and decisions with realistic prompts; for installer/packager code, use executable regression tests. Keep the same prompt and evidence for the before/after comparison.

Edit the owning source: visual decisions in `skills/INSTRUCTION.md`, mechanics in skill references, token data in `theme/tokens/`, and the Neon base's components, layouts and slot mapping in `registry/`. Reference-design and Brand Intensity rules apply to campaign and landing pages only and must not override functional product guidance. Use the terms in [GLOSSARY.md](GLOSSARY.md) and record hard-to-reverse decisions as ADRs in [docs/adr](docs/adr/).

Use a branch such as `codex/describe-the-change` and a focused pull request. Do not change release versions or publish as a side effect of a documentation refactor.

## Validate

Run from the repository root:

```sh
node scripts/validate.mjs
git diff --check
```

`validate` prints each step as it starts and each test file as it finishes. It and the [browser suite](evals/templates/README.md) take one lock for the machine, so runs started from several worktrees queue: a waiting run prints the run it waits for, by pid and worktree, and a run that was killed blocks nothing.

The resource check follows local Markdown links and plugin-root paths in distributed skills and reviewed examples (`examples/`), parses skill frontmatter strictly (an unquoted `: ` or ` #` in a plain `description` is rejected, and descriptions are limited to 1024 characters), rejects shipped Markdown that is not UTF-8 or contains double-encoded (mojibake) text, and repeats against a newly packaged artifact. It also checks plain-text file references (bare Markdown filenames, backticked top-level directories, `../` paths and repository paths with an extension) in all Markdown and in code comments under `theme/` and `scripts/`, excluding `templates/`, `theme/examples/`, the Core snapshot in `core/` (its docs name Core's paths, not this repository's) and ignored paths. The packager rejects missing required top-level payloads. These checks do not validate every CDS API example or enforce design taste.

`theme/tokens/colors.json` and `theme/tokens/theme.json` are not raw exports: the Core sync writes them. `theme/tokens/breakpoint.json` is the raw breakpoint export; `registry/theme/breakpoints.config.ts` is maintained by hand beside it. The CSS adapter's font family, weight, space and radius values are updated by hand using the method in its header. Do not automatically replace missing mappings with guesses. Before naming the Neon registry items a token change affects, list them with `node scripts/registry-consumers.mjs <token>`.

### Sync the Core snapshot

The Core snapshot in `core/` is compiled, never edited: a rule or value changes in Core, and which Core doc an item matches changes in `registry/core-counterparts.json`. Core's repository owns the compile ([ADR 0012](docs/adr/0012-core-compiles-the-snapshot-and-holds-the-palette.md)): the sync runs the checkout's Web compile, copies what it wrote, writes `core/index.json` from the Counterpart table and records the commit, the look the compile reports for the run and each file's hash. Re-sync from a Core checkout whose docs are committed:

```sh
node scripts/sync-core.mjs --from <Core checkout>
```

A Core commit older than Core's compile script has none to run: add `--compiler <Core checkout>` with a newer checkout, and the snapshot records that checkout's commit beside the docs'.

The sync compiles what the checkout has checked out, and another session may move it. Add `--at <commit or ref>` to pin the snapshot to a commit: the sync compiles it in a temporary worktree of the checkout and removes the worktree after, so the checkout's own working tree and branch stay as they are.

The same run writes the palette, `theme/tokens/colors.json`: every Primitive of Core's `Colors` library, which every token resolves against ([ADR 0012](docs/adr/0012-core-compiles-the-snapshot-and-holds-the-palette.md)). Core's compile does not carry the library, so the sync reads Core's record of it, the `primitives` of `<Core checkout>/docs/theme/theme.json`, at the commit it compiled, and records the palette's hash in `core/snapshot.json`. It keeps the file's shape: hue, then step, lowercase hex with an `ff` alpha left off, and no newline at the end. It prints each primitive whose value moved, and the pull request lists them. A Core commit with no `primitives` is refused. `validate` fails when the palette is not the one the sync wrote. `--from-snapshot` carries the hash and cannot write the palette.

To see what a sync would bring without moving the pin, add `--dry-run`: it compiles, refuses what a sync refuses and prints the same report, and writes nothing. It does not write or check the Theme export or the adapter.

An entry of the Counterpart table has five fields, and the sync and `validate` refuse any other:

- `core`: the Core doc the item matches, or `null` for an item with no Counterpart.
- `why`: why the item has no Counterpart, required with `"core": null`; beside a Counterpart, what the match rests on.
- `unmatched`: for an item with no Counterpart, the approved Core doc that has its name.
- `notInCore`: the item's prop values that have no Core cell, as `{ "variant": ["outline"] }`. They keep working and are not chosen for new work.
- `notInCorePassThrough`: the library an item hands its other props on to, where that library draws from them, in place of a list. The same holds for those props.

A change to the Counterpart table, the Role table or the Type role table alone needs no Core checkout:

```sh
node scripts/sync-core.mjs --from-snapshot
```

It takes the snapshot as checked in, and no other flag: it writes `core/index.json` again from the Counterpart table, then its hash and the seal in `core/snapshot.json`, then the Theme export and the adapter as the sync does (below). The table rules of the sync apply, and it refuses when a compiled file differs from what the sync recorded. It also settles a merge conflict in `core/index.json` or `core/snapshot.json`: take both files whole from the side that moved Core (either side when neither did), then run it. When both sides moved Core, run the sync again. A merge of `main` without a conflict needs neither: `node scripts/validate.mjs` proves the merged snapshot, failing when a file under `core/` or the commit it names differs from what the sync recorded.

The sync fails when Core's compile fails (it refuses uncommitted docs, a value Core states no number for, and a compiled file that would still hold the `iOS=True` look, Figma ids, Revision history or Dynamic Type), when the compile prints no look (the Core commit is from before its compile printed one: sync a newer commit, or add `--compiler`), when a registry item has no entry in the Counterpart table, when an entry names a Core doc the compile left out or did not write, when a Supporting item is given a Counterpart, and when an item with no Counterpart has the name of an approved Core doc and its entry does not name that doc as `unmatched`; it then writes nothing. What a compiled doc holds is changed in Core's repository, not here. `validate` fails when a file under `core/`, or the commit or the look `core/snapshot.json` names, differs from what the sync recorded, and when the Counterpart table breaks the `unmatched` rule against the snapshot. Review the snapshot's diff as Core's change. The sync prints how far Core moved since the snapshot it replaced (the count of Core's commits and their hashes) and the snapshot files added, changed and removed. Core's repository is private and this one is public: the pull request names the two Core commits, the count and those files, and says what changed for Neon in its own words. `--subjects` adds Core's commit subjects to the report for reading; they, and Core's issue numbers, stay out of pull requests, issues and commit messages.


The same run writes what follows the snapshot's Theme: the Theme token export, `theme/tokens/theme.json`, and the colors of the CSS adapter, `theme/css/theme.css`. Which Core Theme token each color role takes, in light and in dark, is the Role table, `theme/css/core-roles.json`, maintained by hand; a role with no Core token says why and keeps its value. The write fails when a Theme token names a primitive `theme/tokens/colors.json` lacks or holds at another value, when the adapter has a color role the Role table does not list, and when the table names a token the snapshot does not have. `validate` fails when the export or an adapter color differs from the snapshot's Theme. The sync prints each color role whose value it changed, per mode. After a sync that changes a color, rebuild the registry, list the registry items that consume each changed role, and check each changed text and background pair with `node scripts/contrast.mjs <text role> <background role>...`, which reads the roles from the adapter and gives the ratio in light and in dark.

It also writes what follows the snapshot's text styles: the adapter's type sizes and line heights, in px. Which Core text style each type role takes is the Type role table, `theme/css/core-type-roles.json`, maintained by hand; the design contract, `skills/INSTRUCTION.md`, restates it for the skills. Font family and weight are not Core's and stay as written. Tracking is not written: the snapshot's text styles state none. The write fails when the adapter has a type role the table does not list, when the table names a text style the snapshot does not have, and when a role lacks its size or line height. `validate` fails when a size or line height differs from the snapshot's text style, and when the design contract's table differs from the Type role table. After a sync that changes a text style, rebuild the registry, refresh the Theme Briefs' type tables with `node scripts/theme-briefs/theme-briefs.mjs scripted-only`, record the Neon base's differences again (`evals/templates/README.md`), and check Thai with stacked marks at 375 and 1440 wide.

### Check registry, app and skill changes

The registry's built items in `registry/r/` carry a copy of every file they install, the CSS adapter included. After changing `registry/` or a file an item copies, rebuild them with `node scripts/build-registry.mjs`; `validate` fails on a stale build.

For registry, template or theme changes, run `node scripts/smoke-new-app.mjs`. It builds the registry, serves it locally, creates an app with the New install mode, adds an item and a Theme Brief with Add, and builds the app, once outside any repository and once under `.local/smoke/`. It removes both apps when every step passes and keeps them, saying where, when one fails. Then inspect the affected UI in an app it leaves in place (`--keep`, or a destination: `node scripts/smoke-new-app.mjs <app dir>`); `node scripts/preview-app.mjs <app dir>` serves a build and prints `Ready: <url>` only once it answers. Check relevant light/dark modes, narrow/wide layouts, Thai/English labels, keyboard interactions and task states. Record actual evidence, including blocked checks.

Before every push, `node .github/scripts/browser-changes.mjs origin/main HEAD` says whether the change needs the [browser suite](evals/templates/README.md): it prints the browser paths the branch changed, the list CI reads. When it prints one, run the suite with `--target neon`, which creates the app from the registry and holds it to the frozen CDS-era baselines and Core. It leaves its report under `.local/evals/templates/neon/`; CI runs it and uploads the report separately from the plugin.

For changes to the browser probe, its runner or their fixtures, check on Linux before calling them done, not only on macOS. CI runs the browser job in `mcr.microsoft.com/playwright` with Linux Chrome and without macOS system fonts. Process cleanup, Chrome's temporary files and font fallbacks behaved differently there and failed CI twice after local runs passed. Use the image tag `template-browser.yml` names, or push early and read the CI result.

For skill changes, compare baseline/revised decisions and representative app behavior; word count alone is not a quality metric. Read only task-relevant references during evaluation and record actual questions, setup actions and files read. Use [evals/skills/README.md](evals/skills/README.md). A read-through can verify retrieval/routing; only implemented and rendered apps support claims about visual output improvement.

## Review and release

A pull request should state the original problem, resulting employee behavior, validation performed, and material limitations. Reviewers apply [CODING_STANDARDS.md](CODING_STANDARDS.md), including its rule for evidence claims in pull requests and eval records. Include before/after evidence for a visual change. A design owner should review mapping changes; do not label a provisional mapping approved without that review.

A release runs in this order:

1. `node scripts/release.mjs <version>` sets the version in the three files that state it, rebuilds `registry/r/` so every item URL names `neon--v<version>`, packages the plugin into an empty directory and checks it and the npm package. It prints the steps below.
2. `node scripts/validate.mjs` and the browser suite, then the pull request, merged with `node scripts/merge-pr.mjs <n>`.
3. Tag the merge commit `neon--v<version>` and push the tag. Skills install registry items from raw files at that tag, so until it exists the item URLs on `main` return 404.
4. The owner runs `npm publish` from the tagged commit. `prepublishOnly` refuses a checkout whose tag is not on `origin` or names another commit.
5. Install on a real host with `npx finnomena@latest setup`, and review relevant generated UI.

Keep host installation, browser checks and design approval marked unverified until actually performed. A release's accessibility testing status is `node scripts/a11y-status.mjs`, read from the browser suite (axe screens, behavior tests) and `registry/screen-reader-passes.json` (manual passes, each with its reader, browser and date): quote it only after the browser suite passes on the release commit. CI validates pull requests and merge groups with two workflows. `validate.yml` always runs: it lints every workflow with a pinned, checksum-verified `actionlint`, then runs `node scripts/validate.mjs`. `template-browser.yml` always reports, but its browser job runs only when the registry, starter, theme, browser suite, assembler, browser probe or a file its scripts load changes; otherwise it is skipped, which a required check counts as passing. Neither publishes a plugin or changes branch protection. Branch protection on `main` requires `validate` and an up-to-date branch, so merge `main` into a pull request branch that falls behind before merging it, or add it to the merge queue where one is enabled. `node scripts/merge-pr.mjs <pr>` does that until the merge goes in: in the worktree that has the branch, it merges `origin/main`, pushes, waits for the checks and squash-merges, and starts again when `main` moved meanwhile (six tries); it settles a conflict that is only in generated files by generating them again (`registry/r/` with the registry build; `core/snapshot.json` and `core/index.json` from the side that moved Core, with `--from-snapshot`), and stops on any other conflict, naming the files, when both sides moved Core, and on a failed check. `evals/skills/merge-pr.test.mjs` scripts git and gh for it. It requires no review, so a pull request GitHub shows as BLOCKED is waiting on `validate`, not on a reviewer. The browser path list and the rule that any doubt runs the browser job live once, in `.github/scripts/browser-changes.mjs`, which `evals/skills/browser-changes.test.mjs` exercises against a temporary repository.

For real visual references, use [the example-library workflow](docs/design/example-library.md). To author or change a Theme Brief, its presets or picks files, follow [the Theme Brief write-up](docs/design/theme-briefs.md). Keep illustrative examples, behavioral fixtures and explicitly reviewed design references distinct.
