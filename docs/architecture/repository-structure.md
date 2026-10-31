# Repository structure

## Directory map and ownership

| Path | Owner | What it is |
| --- | --- | --- |
| `.claude-plugin/` | maintainer | Plugin manifest (`plugin.json`) and self-hosted marketplace metadata (`marketplace.json`). Tracked and visible to Git — this is how the Claude Code plugin is discovered. |
| `.codex-plugin/` | maintainer | Codex plugin manifest (`plugin.json`), read by `codex plugin add`. Points at the same `skills/` directory as the Claude Code manifest; the marketplace metadata in `.claude-plugin/marketplace.json` is shared across hosts. |
| `skills/` | maintainer | The four distributed skills (`neon-audit`, `neon-create`, `neon-redesign`, `neon-review`) and their reference docs. |
| `GLOSSARY.md`, `docs/adr/` | maintainer | Domain vocabulary and recorded decisions for maintainers. Not packaged, so distributed skills define terms inline instead of linking here. |
| `theme/` | maintainer | Canonical theme assets — the raw Figma token export (`theme/tokens/`), generated/resolved token files, CDS-tier adapters (`theme/cds/`), the CSS-variable tier (`theme/css/theme.css`), and the generator scripts (`theme/scripts/`) that produce the generated files from the raw tokens. One source of truth; `skills/INSTRUCTION.md` and the starter both trace back to it. |
| `templates/vitejs-cds/` | maintainer | Starter source — application wiring and layout patterns only, no tracked theme files of its own (assembled from `theme/cds/` at build time). |
| `scripts/` | maintainer | Stable, public commands: the installer (`install.mjs`), the maintainer assembly CLI (`assemble-starter.mjs` + `scripts/lib/`), and the plugin packager (`package-plugin.mjs`). |
| `docs/` | maintainer | This directory — curated, tracked documentation about the repository itself (architecture). Not shipped in the distributed plugin. |
| `evals/skills/` | maintainer | Skill scenarios and packaging regression checks, run with `node --test evals/skills/*.test.mjs`. |
| `evals/templates/` | maintainer | Browser suite for the starter: assembles a disposable app, builds it and runs Playwright layout and integration checks. Reports go to `.local/evals/templates/`. |
| `.local/` | (nobody — local only) | Everything that isn't maintained source: local research, working notes, generated eval apps, and run history. Fully ignored; never packaged, never expected to exist in a fresh clone. |
| `notes/`, `.superpowers/`, `.claude/` | (nobody — local only) | Other local-only working state, unrelated to this migration. Stay ignored as before. |

## Packaging boundary

`node scripts/package-plugin.mjs <destination-dir>` is the authoritative definition of what ships. It copies an explicit allowlist — currently `.claude-plugin/`, `.codex-plugin/`, `skills/`, `theme/`, `templates/vitejs-cds/`, `scripts/install.mjs`, `scripts/assemble-starter.mjs`, `scripts/lib/`, and `LICENSE` — into the destination. Everything else (`docs/`, `evals/`, `.local/`, `notes/`, dependencies, build output) is excluded by construction, not by convention: it's simply not in that list. If a path should ship, it has to be added to `PAYLOAD_ENTRIES` in that script; being tracked in Git is necessary but not sufficient.

## Local material

Local research, working notes, generated evaluator apps, and run history live under `.local/`, fully ignored, so a fresh clone never sees them and they're never packaged:

```text
.local/
  migrations/            # this migration's manifest + notes (repository-restructure.json, -notes.md)
  research/{references,resources}/   # reference material, other repos studied, etc.
  notes/{ideas,superpowers}/         # working ideas; completed/superseded implementation plans
  evals/                 # generated eval apps and run output (screenshots, results) — one dir per run
```

In a Git worktree, its own `.local/` is deleted with the worktree. Keep anything worth keeping in the main checkout's `.local/`, at `$(git rev-parse --path-format=absolute --git-common-dir)/../.local/`.

## Commands

Token pipeline (regenerate after changing anything in `theme/tokens/*.json`):

```sh
node theme/scripts/sync-tokens.mjs && node theme/scripts/generate-theme-config.mjs && node theme/scripts/generate-breakpoints-config.mjs
```

Preview the starter after editing canonical theme assets (pure filesystem assembly, no package manager touched):

```sh
node scripts/assemble-starter.mjs /tmp/neon-preview && cd /tmp/neon-preview && npm install && npm run dev
```

Install into a real consuming project (does the same assembly, then installs dependencies):

```sh
node scripts/install.mjs <target-dir> --new
```

Package a complete, self-contained plugin artifact:

```sh
node scripts/package-plugin.mjs <destination-dir>
```

Run the skill and packaging checks:

```sh
node scripts/validate.mjs
```

Run the starter browser suite after template or theme changes:

```sh
npm ci --prefix evals/templates
npx --prefix evals/templates playwright install chromium
npm test --prefix evals/templates
```
