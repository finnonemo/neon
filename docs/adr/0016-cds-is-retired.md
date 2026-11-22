# The CDS install mode and theme are retired

> Status: Accepted, 2026-11-22.

[ADR 0006](0006-new-work-on-shadcn-matched-to-cds.md) froze the CDS install mode and theme files "for apps already on CDS" and left retiring them as a separate decision; [ADR 0009](0009-neon-matches-core-not-cds.md) kept the freeze. On 2026-11-14 the owner confirmed that no employee app in use is on CDS. The frozen files hold values the rest of Neon has left behind (`bgLine` is Black/5A there and Black/12A in the CSS adapter), and they keep a starter, a browser test target, generator scripts and CDS guidance in the skills alive for nobody. So the CDS install mode, `theme/cds/`, `templates/vitejs-cds/` and the CDS guidance are removed in Neon 2.0.0.

## Decisions

- **Removed.** The CDS Install mode, with the installer's `--sync-starter`, `--package-manager` and `--skip-install` options that served only it; `theme/cds/`; `templates/vitejs-cds/` and the starter assembler; the browser suite's CDS target, its CDS fixtures and `npm run baseline`; the scripts that generated the CDS theme config, `scripts/cds-consumers.mjs`; the CDS references in the skills; and each raw export under `theme/tokens/` that only those generators read.
- **Kept.** `theme/tokens/colors.json` and `theme/tokens/theme.json`, which the CSS adapter, the Immersive Themes and the Theme Brief scripts read ([ADR 0012](0012-core-compiles-the-snapshot-and-holds-the-palette.md)), and `theme/tokens/breakpoint.json`, which the layout checks read. The browser suite (`evals/templates/`) stays and runs on the Neon target only. Its `fixtures/cds-baseline.json` and `fixtures/cds-layout-baseline.json` stay byte for byte under their names: they are frozen reference numbers that Neon's checks read, captured from the CDS starter before its removal. Nothing regenerates them, and they create no dependency on CDS. Card, the one item with no approved Counterpart, keeps the measurements it has: those are numbers in the registry, not a dependency on CDS. Two files the Neon base ships moved out of the CDS folders unchanged: the page shell to `registry/base/index.html` and the breakpoints to `registry/theme/breakpoints.config.ts`.
- **An app found on CDS afterwards.** The skills say that Neon no longer themes CDS and offer a Rebuild on the Neon base. The installer refuses a run with no mode, which used to be the CDS Install mode, with the same words. The last release with CDS support, 1.0.3, stays installable by its tag.

## Considered Options

- **Stay frozen with no end:** rejected. The files cost checks and reading time on every change, and they tell a new maintainer that Neon supports two bases.
- **Move the CDS files to a repository of their own:** rejected. There is nobody to serve, and the release tag already keeps them.

## Consequences

- Removing an Install mode is a breaking change, so the release is Neon 2.0.0.
- The Install modes lose CDS, and `GLOSSARY.md`'s **Canonical theme assets** and **Install mode** lose their CDS sentences.
- `neon-create`'s description stops offering to build in an app already on CDS, and `neon-audit` stops listing CDS as an integration choice.
- `README.md`'s first paragraph says that Neon no longer themes CDS.
- The source lint keeps its CDS rules, and the eval graders keep telling a CDS app apart, so a run that meets one is still graded.
