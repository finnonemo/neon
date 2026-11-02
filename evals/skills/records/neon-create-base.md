---
scenarios:
  - request: Create a Finnomena Back Office, Product Feature or Campaign Page app from an empty workspace
    observe: The app is created with `install.mjs --new` and grows with `--add` only; `neonBaseCheck` in `grade-rebuild.mjs` finds no CDS, no stock shadcn item and no stock shadcn marks; a Campaign Page passes its Immersive Theme to `ImmersiveLayout`; the report names each `@neon/` item added
---

# neon-create on the Neon base

Three realistic requests, each run once with the current `main` package as baseline (`43030ef`) and once with this change as revised (`e83df00`), November 2026. The runs used Claude Code 2.1.316 with `run-claude-case.mjs --model claude-opus-5-5 --serve-registry`, the runner's allowlist and permission note, and the browser tool. `--serve-registry` served this checkout's Neon registry on localhost and set `NEON_REGISTRY_URL`, because the pinned `neon--v0.5.0` registry is not published yet. The agent ran the plain `install.mjs` command and never saw the URL.

Fixture: an empty workspace, a git repository holding only `.gitkeep`. Each request names a subfolder, because `--new` refuses a nonempty destination and the workspace holds `.git`. Requests, verbatim, with each arm's own port:

> /neon:neon-create Create a Finnomena back office app in ./kyc-review for the operations team to review pending KYC applications: a list with status filters, a detail view, and approve or reject actions. There is no backend yet, so use mock data. Run its dev server on port 5411.

> /neon:neon-create Create an app in ./fund-compare for a new Finnomena customer feature: compare up to three mutual funds side by side by return, fees, risk level and minimum investment, with a button to start investing in one. Customers mostly use it on their phones. Use mock data. Run its dev server on port 5421.

> /neon:neon-create Create a campaign landing page in ./private-year-end for Finnomena Private's year-end tax-saving campaign: a hero, three featured SSF and RMF funds, the benefits, and a sign-up call to action. Use mock data. Run its dev server on port 5431.

| Run | Installer calls | CDS | `components.json` `@neon` | `neonBaseCheck` | Build | Report names `@neon/` items | Cost |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Back Office, baseline | `--new` (the CDS starter) | `cds-web`, `cds-icons` | None | Fail: no `components.json`, CDS | Pass | No | $7.42 |
| Back Office, revised | `--new`, then `--add tag list-row segmented-control dialog textarea label input table` | None | Yes | Pass | Pass | Yes, and says `table` went unused | $2.84 |
| Product Feature, baseline | `assemble-starter.mjs` (the CDS starter) | `cds-web`, `cds-icons` | None | Fail: no `components.json`, CDS | Pass | No | $3.12 |
| Product Feature, revised | `--new`, then `--add table list-row tag dialog input label checkbox segmented-control` | None | Yes | Pass | Pass | In its Handoff Summary file, not the closing message; says `list-row` went unused | $3.36 |
| Campaign Page, baseline | `--new` (the CDS starter) | `cds-web`, `cds-icons` | None | Fail: no `components.json`, CDS | Pass | No | $2.80 |
| Campaign Page, revised | `--new`, then `--add input label tag checkbox select segmented-control` | None | Yes | Pass | Pass | Yes | $2.84 |

No revised app has a stock palette utility, `dark:` class, stock text size or weight utility in its source outside `./src/components/ui/`; the same grep finds `font-medium` in a stock shadcn accordion. `appStylesheetProblems` finds no unscoped selector in any revised app. In the baseline Campaign Page it flags the `[data-immersive-theme]` rules of the generated theme CSS the app copied, which was the contract on `main`. The revised Campaign Page passes `immersiveTheme` to `ImmersiveLayout`, defaulting to `"private"`, with a theme toggle shown only on the dev server or with `?review` in the URL. A quick look at each revised app's production build in an 800px-wide browser pane found Neon type and color roles, IBM Plex Sans Thai and populated screens after the mock loading state.

Limits:

- One sample per arm, so the difference is the base each skill names, not a measured rate.
- Costs are each run's last reported `total_cost_usd`, which is cumulative. Every run hit the 2700-second cap after its closing report, because the dev server it started for the request kept the session open. The reports and diffs are complete; the cap is the harness, not the skill.
- Grading is `neonBaseCheck`, a build, a source grep and one screenshot per revised app. Interaction, 375px layout, dark scheme and parity were not graded here.
- Only new apps were exercised. Adding to an existing Neon-base or shadcn app, and the CDS frozen path, ran in no sample.
- The served registry is this checkout's; the released one may differ until it is tagged.
