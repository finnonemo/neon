# PROTOTYPE 84: throwaway, do not merge

Answers finnonemo/neon#84: do preset combinations give distinct, on-theme Theme Briefs that neon-create can build from? Built on the decisions in #77, #81, #82, #83 and #110. Lives on the branch `prototype/84-theme-brief-presets` only; the real generator is Python (#110) and none of this code is meant to be kept.

| Path | What it is |
|---|---|
| `themes/`, `presets/`, `picks/` | Theme texts, the three preset kinds and the picks files (closed schemas, no hex, fonts or px) |
| `picks-invalid/` | Picks the generator must refuse |
| `prompt-library/` | The seven entries plus `shared.json` |
| `build.mjs` | Validates picks, runs the entries through `claude -p` with checks, renders the brief |
| `out/` | The three drafted briefs, their run records, and `compare.md` |
| `compare.mjs` | Section sameness between briefs; token-lookup, contrast and variable checks |
| `assemble-app.mjs` | A disposable Neon-base app with one brief hand-placed |
| `stand-in/theme-brief.md` | A rough neon-create reference written from #82, used only for this run |

```bash
node theme-briefs/PROTOTYPE-84/build.mjs --check-only picks/club-run.json picks-invalid/club-run-support.json
node theme-briefs/PROTOTYPE-84/build.mjs picks/club-run.json
node theme-briefs/PROTOTYPE-84/build.mjs --scripted-only picks/club-run.json
node theme-briefs/PROTOTYPE-84/compare.mjs
```

Drafting needs a signed-in `claude` CLI. Per-attempt output and review notes go to `.local/theme-briefs-84/`.
