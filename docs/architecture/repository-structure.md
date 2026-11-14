# Repository structure

## Directory map and ownership

| Path | Owner | What it is |
| --- | --- | --- |
| `.claude-plugin/` | maintainer | Plugin manifest (`plugin.json`) and self-hosted marketplace metadata (`marketplace.json`). Tracked and visible to Git — this is how the Claude Code plugin is discovered. |
| `.codex-plugin/` | maintainer | Codex plugin manifest (`plugin.json`), read by `codex plugin add`. Points at the same `skills/` directory as the Claude Code manifest; the marketplace metadata in `.claude-plugin/marketplace.json` is shared across hosts. |
| `skills/` | maintainer | The six distributed skills (`neon-audit`, `neon-block`, `neon-create`, `neon-deck`, `neon-redesign`, `neon-review`), their reference docs and the shared design contract `INSTRUCTION.md`. |
| `GLOSSARY.md`, `docs/adr/` | maintainer | Domain vocabulary and recorded decisions for maintainers. Not packaged, so distributed skills define terms inline instead of linking here. |
| `theme/` | maintainer | Canonical theme assets — the raw Figma token export (`theme/tokens/`; its `theme.json` and the CSS adapter's colors are written from the Core snapshot by the Core sync, through the Role table `theme/css/core-roles.json`, and the adapter's type sizes and line heights through the Type role table `theme/css/core-type-roles.json`), generated/resolved token files, the frozen CDS theme files (`theme/cds/`, for apps already on CDS), the CSS adapter (`theme/css/theme.css`), the Immersive Themes (`theme/immersive-themes.json` and `theme/css/immersive-themes.css`), the Finnomena logos (`theme/logo/`), and the generator scripts (`theme/scripts/`) that produce the generated files from the raw tokens. One source of truth; `skills/INSTRUCTION.md` and the starter both trace back to it. |
| `registry/` | maintainer | The Neon registry: shadcn/ui items for the Neon base (`registry.json` and its base, component, layout, theme and Theme Brief sources), the Counterpart table (`core-counterparts.json`), built by `scripts/build-registry.mjs` into the tracked `registry/r/`, which pins every item URL to the release tag. `theme.css` is read from `theme/css/`, not copied. |
| `core/` | generated | The Core snapshot: Core compiled for the web, pinned to one Core commit in `snapshot.json` and read through `core/index.json`. Written only by the [Core sync](../../CONTRIBUTING.md#sync-the-core-snapshot); the repository check fails when a file differs from what the sync wrote. |
| `block/` | generated | The Block snapshot: the Block engine built into one file (`block-engine.mjs`, with `hb.wasm` and the open IBM Plex fonts it draws text in), pinned to one Block commit in `manifest.json`. Written by `node scripts/sync-block.mjs --from <Block checkout>` and never edited by hand; the repository check fails when a file differs from what the sync wrote. Finnomena Trek's font files may sit in `block/fonts/` as local files, which are ignored by Git and never packaged ([ADR 0010](../adr/0010-neon-carries-blocks-engine-and-ships-as-finno.md)). |
| `templates/vitejs-cds/` | maintainer | The frozen CDS starter source, for apps already on CDS — application wiring and layout patterns only, no tracked theme files of its own (assembled from `theme/cds/` at build time). A new app starts from the Neon registry instead (`install.mjs --new`). |
| `theme-briefs/` | maintainer | Theme Brief presets, picks files, theme texts and authoring records. Maintainer-only, not packaged; see [theme-briefs.md](../design/theme-briefs.md). |
| `research/` | maintainer | Tracked research scripts and notes (`neon-vs-base-tokens.mjs`, `skill-and-theming-ideas.md`). Not packaged. |
| `scripts/` | maintainer | Stable, public commands: `finno` (`finno.mjs`, the published command and local tool server), the installer (`install.mjs`: New, Add, CSS-only and the frozen CDS mode), the Core and Block snapshot syncs (`sync-core.mjs`, `sync-block.mjs`), the maintainer CDS starter assembly CLI (`assemble-starter.mjs` + `scripts/lib/`), the browser probe runner skills use without a browser tool (`probe-page.mjs`), the warn-only source lint the shared verification checklist runs (`source-lint.mjs`, rules in `scripts/lib/source-rules.mjs` that the eval graders also import), the build-then-serve preview that waits for HTTP 200 (`preview-app.mjs`), a read-only report of Chrome's DevTools endpoint for REA (`cdp-status.mjs`), the Theme Brief listing and recognition `neon-create` runs (`theme-brief.mjs`), the plugin packager (`package-plugin.mjs`), the registry builder (`build-registry.mjs`, guards in `scripts/lib/registry.mjs`), the disposable-app check (`smoke-new-app.mjs`), the token and consumer lookups (`token-lookup.mjs`, `contrast.mjs`, `registry-consumers.mjs`, `cds-consumers.mjs`), and the repository check run by `validate.mjs` (`check-repository.mjs`). `scripts/theme-briefs/` holds the maintainer-only Theme Brief tool and its checks. |
| `docs/` | maintainer | This directory — curated, tracked documentation about the repository itself: architecture, the ADRs, agent configuration and design notes. Not shipped in the distributed plugin. |
| `evals/skills/` | maintainer | Skill scenarios and packaging regression checks, run with `node --test evals/skills/*.test.mjs`. |
| `evals/templates/` | maintainer | Browser suite for the CDS starter and the Neon base: assembles a disposable app (`--target neon` creates one with `shadcn init` from the local registry), builds it and runs Playwright layout, integration and CDS-match checks. Reports go to `.local/evals/templates/<target>/`. |
| `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `CODING_STANDARDS.md`, `GLOSSARY.md`, `LICENSE`, `marketplace.example.json` | maintainer | Root documents and the example marketplace file. `README.md` is the employee-facing entry point; `AGENTS.md` and `CONTRIBUTING.md` are for maintainers and their agents. |
| `package.json` | maintainer | The npm package `finnomena`, whose command is `finno`. Its `files` list decides what the npm package carries. |
| `.github/` | maintainer | CI workflows: `validate.yml` (`node scripts/validate.mjs`) and `template-browser.yml` (the browser suite). |
| `.local/` | (nobody — local only) | Everything that isn't maintained source: local research, working notes, generated eval apps, and run history. Fully ignored; never packaged, never expected to exist in a fresh clone. |
| `notes/`, `.superpowers/`, `.claude/` | (nobody — local only) | Other local-only working state. Ignored by Git. |

## Packaging boundary

`node scripts/package-plugin.mjs <destination-dir>` is the authoritative definition of what ships. It copies an explicit allowlist — currently `.claude-plugin/`, `.codex-plugin/`, `skills/`, `theme/`, `core/`, `block/`, `templates/vitejs-cds/`, `scripts/install.mjs`, `scripts/assemble-starter.mjs`, `scripts/source-lint.mjs`, `scripts/probe-page.mjs`, `scripts/theme-brief.mjs`, `scripts/finno.mjs`, `scripts/package-plugin.mjs`, `scripts/lib/`, and `LICENSE` — into the destination, leaving out Finnomena Trek's font files. Everything else (`docs/`, `evals/`, `registry/`, `theme-briefs/`, `research/`, `.local/`, `notes/`, dependencies, build output) is excluded by construction, not by convention: it's simply not in that list. If a path should ship, it has to be added to `PAYLOAD_ENTRIES` in that script; being tracked in Git is necessary but not sufficient.

The npm package `finnomena` has its own boundary, the `files` list in `package.json`. It carries the plugin payload and also `registry/`, all of `templates/` and all of `scripts/`, and likewise leaves out the Trek font files.

## Local material

Local research, working notes, generated evaluator apps, and run history live under `.local/`, fully ignored, so a fresh clone never sees them and they're never packaged:

```text
.local/
  migrations/            # this migration's manifest + notes (repository-restructure.json, -notes.md)
  research/{references,resources}/   # reference material, other repos studied, etc.
  notes/{ideas,superpowers}/         # working ideas; completed/superseded implementation plans
  evals/                 # generated eval apps and run output (screenshots, results) — one dir per run
```

In a Git worktree, its own `.local/` is deleted with the worktree. Keep anything worth keeping in the main checkout's `.local/`, at `$(git rev-parse --path-format=absolute --git-common-dir)/../.local/`. A session isolated to its worktree cannot write there with file tools: write in the worktree's `.local/`, then `cp` it across.

## Commands

Token pipeline (regenerate after changing a raw export in `theme/tokens/`; `theme/tokens/theme.json` is written by the Core sync, so the generators only read it, and `generate-theme-config.mjs` rewrites `theme/cds/color-mapping.todo.md`, a change to leave out because CDS is frozen — see [CONTRIBUTING.md](../../CONTRIBUTING.md)):

```sh
node theme/scripts/sync-tokens.mjs && node theme/scripts/generate-theme-config.mjs && node theme/scripts/generate-breakpoints-config.mjs
```

Preview the frozen CDS starter after editing the CDS theme files (pure filesystem assembly, no package manager touched):

```sh
node scripts/assemble-starter.mjs /tmp/neon-preview && cd /tmp/neon-preview && npm install && npm run dev
```

Serve any app's production build and wait until it answers (it builds, starts `npm run preview`, and prints `Ready: <url>` after HTTP 200; run it in the background and wait for that line):

```sh
node scripts/preview-app.mjs <app-dir> [--port <n>]
```

Before an REA browser inspection, report whether Chrome exposes a DevTools endpoint (read-only; it never enables remote debugging):

```sh
node scripts/cdp-status.mjs
```

Start an app from the Neon base, or add Neon registry items to an app, from the registry pinned to this release (`shadcn init` / `shadcn add`):

```sh
node scripts/install.mjs <target-dir> --new
node scripts/install.mjs <app-dir> --add <item>...
```

Build this checkout's registry, create and build disposable apps from it inside and outside a repository:

```sh
node scripts/smoke-new-app.mjs
```

Package a complete, self-contained plugin artifact:

```sh
node scripts/package-plugin.mjs <destination-dir>
```

Run the skill and packaging checks:

```sh
node scripts/validate.mjs
```

Sync the Core snapshot or the Block snapshot from a checkout of the source:

```sh
node scripts/sync-core.mjs --from <Core checkout>
node scripts/sync-block.mjs --from <Block checkout>
```

Run the browser suite after template, registry or theme changes (add `-- --target neon` to build the app from this checkout's registry):

```sh
npm ci --prefix evals/templates
npx --prefix evals/templates playwright install chromium
npm test --prefix evals/templates
```
