# Smoke test: build a Finnomena app from scratch

Single-shot prompt to hand to any skill-capable coding agent (including weaker/smaller models —
originally targeted at Qwen 3.8) in a fresh, empty folder with the `neon` plugin/skills
available. Exercises `neon-create`'s scaffold path end-to-end: new-project routing, CDS install,
theme wiring, multi-page build with real states, and a verified run.

## Prompt

```text
Build a new Finnomena investment app from scratch in this empty folder, using React and the
Coinbase Design System (CDS) through Finnomena's theme. There's no backend yet, so use mock
data/services under the hood — but build it to look and behave like a real production app: no
"demo" banner, mock-data disclaimer, or other placeholder chrome in the UI.

Build these pages, each reachable via navigation:
1. Dashboard — portfolio total value, today's change (gain/loss with color), a breakdown of
   holdings by asset class, and a few quick-action buttons.
2. Transaction History — a list of past transactions (buy/sell/dividend), each showing date,
   asset name, type, amount and status. Support filtering by transaction type and date range.
3. Portfolio / Holdings — a list of currently held assets with quantity, current value, and
   gain/loss per holding. Clicking a holding opens a detail view.
4. Profile / Settings — basic account info and a theme/notification preferences section.

Requirements:
- Use real CDS components (@coinbase/cds-web), not plain HTML/CSS — install and wire them up.
- Use Finnomena's navy/white functional theme with indigo highlights, per the shared brand
  tokens — do not invent your own colors.
- Every page needs loading, empty and error states in addition to the populated state, using
  mock data/services — no need to expose that in the UI, just tell me what's mocked when done.
- Make it responsive: usable on both mobile and desktop widths.
- After building, start the dev server and confirm each of the 4 pages actually renders
  without errors before reporting done.

When finished, tell me: which pages were built, what was mocked vs. real, and how you verified
the app runs (command used, what you observed).
```

## Why it's written this way (for a weaker executor)

- Names "Finnomena" and "CDS" explicitly so skill routing doesn't rely on inference —
  `neon-create`'s trigger is intent-based on that wording (see `skills/neon-create/SKILL.md`).
- Enumerates exactly 4 pages instead of "etc." so a weaker model can't under-deliver by
  stopping after the dashboard.
- Explicitly bans invented colors and requires real CDS components, since `neon-create`'s
  workflow calls out "Do not invent imports, tokens or backend behavior" as a common failure.
- Forces an explicit verification step (start dev server, confirm each page renders) rather
  than trusting a self-report — every skill's `Done` section warns against claiming unverified
  checks.

## What to check on a run

- Did it route to `neon-create` (new empty destination → scaffold), not `neon-audit`?
- Is `@coinbase/cds-web` actually installed and are components real CDS imports, not hand-rolled
  HTML/CSS mimicking CDS?
- Do colors match Finnomena's navy/white/indigo functional palette, not invented hex values?
- Were all 4 pages built, each with loading/empty/error/populated states?
- Was the dev server actually started and each page confirmed rendering (vs. just claimed)?
- Is mocked data/behavior kept out of the shipped UI (no demo/mock banner, tag, or state-simulator control) and disclosed in the report instead?
