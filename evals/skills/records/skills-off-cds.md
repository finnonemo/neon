---
scenarios:
  - request: Add a fee table that stays readable on a phone to an app on the Neon base
    observe: Opens no CDS reference; the references it reads hold no CDS component name; builds with Neon items and adds no CDS dependency
  - request: Add the same fee table to an app already on CDS
    observe: Reads the CDS reference; builds with `@coinbase/cds-web` components; adds no `components.json`, `@neon` registry or Neon item
---

# Skills off CDS

For finnonemo/neon#220: the skills default to the Neon base, and what they say about CDS components, setup and patterns sits in [CDS integration](../../../skills/neon-create/references/cds-integration.md), linked only behind "already on CDS". One request ran once on each base with `main` as baseline (`dc23278`) and with this change as revised (`9387b43`), November 2026, through `run-claude-case.mjs --model claude-opus-5-5 --serve-registry --cap 1800` on Claude Code 2.1.323, with the runner's allowlist, permission note and browser tool.

Fixtures: the Neon-base app is `.local/evals-fixtures/219/plan-app`, the app of [Core component rules](core-component-rules.md). The app already on CDS is a copy of the frozen starter, `templates/vitejs-cds`, which depends on `@coinbase/cds-web` and carries no theme files of its own.

Request, verbatim; each run had its own port:

> /neon:neon-create The dev server for this app is already running at http://localhost:{port}. Add a screen that shows this customer's fund fees for October 2026 as a table: fund, share class, fee percent and fee amount in baht. Use mock data. It must stay readable on a phone.

Reads below are from `reference-reads.mjs` and from a by-hand list of every skill file a tool call in the run names. CDS-only names are the ones `off-cds.test.mjs` counts: `ListCell`, `Tray`, `useBreakpointTier`, the CDS providers, `tabularNumbers`, `justifyContent`, `emphasis="low"`, `9.26.1`.

## App on the Neon base

| | Baseline `dc23278` | Revised `9387b43` |
| --- | --- | --- |
| CDS reference | Not opened; seen as a link and in a directory listing | Not opened; seen as a link and in a directory listing |
| Files read | The entrypoint, the design contract, Core rules, functional patterns, Neon base, new UI workflow, readiness, verification | The same eight |
| CDS-only names in those files | 9: four in functional patterns, five in new UI workflow | 0 |
| Lines naming CDS in those files | 26 | 17 |
| Core reads | The index; part of `table.md` and `empty-state.md` | `table.md` and `empty-state.md` whole; listed `core/components/` |
| Built with | `@neon/table` added, `Tag`, `Skeleton`; no CDS dependency | `@neon/table` added, `Tag`, `Skeleton`; no CDS dependency |
| On a phone | Below about 640px the table becomes a two-line list, by a container query | The same approach |
| Denied commands | One compound command | One compound command |
| Turns, cost | 58, $1.86 | 69, $2.38 |
| Verdict | Pass on the reference; it still read CDS component guidance inside the shared references | Pass |

## App already on CDS

| | Baseline `dc23278` | Revised `9387b43` |
| --- | --- | --- |
| CDS reference | Read in part (40% by the tool) | Read whole |
| Other files read | The entrypoint, the design contract, functional patterns, new UI workflow, readiness, verification | The same six |
| Built with | `Table`, `TableFooter`, `Text`, `Button`, `Box`, `Divider`, `Fallback`, `HStack`, `VStack` from `@coinbase/cds-web`; `tabularNumbers` | `Table`, `TableFooter`, `Text`, `ListCell`, `Fallback` from `@coinbase/cds-web`; `tabularNumbers`, `multiline` |
| Neon items | None: no `components.json`, no `@neon` registry, no file under `src/components/ui/` | None |
| Theme | Installed the CDS theme files and the logo | The same |
| On a phone | `useBreakpointTier`; rows built from CDS layout pieces after `ListCell` cut the amounts off | Rows as `ListCell` with `multiline`, switched by the screen's own width |
| Denied commands | Three | Five |
| Turns, cost | 104, $2.76 | 106, $2.81 |
| Verdict | Pass | Pass |

Both arms pass on both bases: the baseline already kept each app on its base. What the change moved is what a Neon-base run loads. The baseline read nine CDS component names in two shared references it needs for any new screen; the revised run read none, and the run on CDS still found the same guidance in the one reference it is sent to.

Limits:

- One sample per arm. Each cell is what a package did once, not a rate; the revised CDS run's `multiline` rows and the higher cost of the revised Neon run are one run each.
- The revised arm ran at `9387b43`. The review fixes after it changed the CDS reference's opening and its line on the color mapping, the design contract's line on what is provisional, the entrypoint's closing line, and the routes in `css-integration.md` and `rebuild.md`. No run read the last two, and none was rerun.
- A first attempt at all four runs stopped after two minutes at an account usage limit and was set aside ungraded.
- A read was graded from `reference-reads.mjs` and the by-hand list together. The tool misses a file read inside a compound command, so the baseline Neon run's reads come from the by-hand list.
- Only `neon-create` was exercised. `neon-redesign`, `neon-review` and `neon-audit` in an app already on CDS, a colors-only change to CDS components, a request to add CDS to an app without it, and a rebuild were not tried: for those the evidence is the static guards.
- The CDS fixture is the bare starter, so each run installed the theme before building. An app on CDS with its own customized theme was not tried.
- The pages were graded on the report, the diff and the source, not on how they look.
- Both Neon arms used an app built at #219's change, and the served registry is this checkout's.
