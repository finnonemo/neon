---
scenarios:
  - request: Build a Back Office fee-report screen with mock data
    observe: Totals equal the sum of rows; numbers right-aligned with tabular figures; a fall in fees takes the color of its declared good direction; a zero prints as `0`; sample values appear in the Handoff Summary.
---

# Sample figures

Fixture: a folder holding only `.gitkeep`. The case runner `git init`s the app folder and the installer refuses a nonempty destination, so the request names a new subfolder. Request, verbatim:

> $neon-create Build a Finnomena Back Office fee-report screen in a new fee-report folder here: fees collected this month per fund and fee type, with totals and the change from last month. There is no backend yet, so use mock data.

Pass requires all of:

- Totals and KPIs are computed from the rows of one data module, with relations asserted in development.
- Numeric cells are right-aligned with tabular figures.
- Each metric declares its good direction, and change color follows it; an unchanged value is unsigned and neutral.
- A real zero prints as zero, not a dash.
- No placeholder names; the Handoff Summary lists the headline sample figures and names the data module.

November 2026, Codex, one sample per revision. Builds were rendered in headless Chromium at 1440×900; per-cell computed styles were read from the DOM.

- **Before (`97ad7b4`):** totals came from the rows of `report.ts`; the 40 numeric cells sampled computed `text-align: right` and `tabular-nums`, from CSS; a zero fee printed `0.00`; the handoff gave the three monthly totals. Change color was "green means up" (`n>=p ? 'fee-up' : 'fee-down'`), so an unchanged value would show a green `+0.0%`. No good direction was declared, and the arithmetic checks ran from a script in `/tmp`, not in the app. Funds were named "Finnomena Thai Equity" and similar. Fail on direction and zero change.
- **After (this revision):** `data.ts` declares `upIsGood: true` and says why (fees are Finnomena revenue); changes use `fgPositive`/`fgNegative` from it, and zero change is `fgMuted` and unsigned. `console.assert` checks run under `import.meta.env.DEV`. The 40 numeric cells sampled compute `text-align: right` and `tabular-nums`; changes use `Text tabularNumbers`. The footer total equals the 1,467,120.00 KPI, a real zero fee prints `0.00`, and funds are fictitious ("Nova Thai Equity"). The handoff lists six headline figures and names `src/features/fees/data.ts`. Pass.

Limits: one sample per revision, Codex only, so the difference may be sampling. Both chose fees as revenue, so a fall rendered `fgNegative` in both; the eval cannot show a run choosing the cost direction. The dev assertions were read, not run: rendered builds are production builds. The development assertions only check each row against its own parts, not the KPIs. Fonts rendered in headless Chromium, not on employee machines. The Campaign Page exclusion was not exercised.
