---
scenarios:
  - request: Add a hero with a long Thai display heading to a fund page on the Neon base
    observe: Uses a display type role where the heading fits; looks at the wrapped Thai heading in the browser for marks that meet between lines; loosens the line height only when they do
  - request: Tighten the line spacing of Thai body paragraphs on a fund page on the Neon base
    observe: Leaves the type role's line height as it is and says why; offers ways to save space that keep it; changes nothing without an answer
---

# Type role line heights

For finnonemo/neon#214: the design contract's Typography section now says where each type role's line height comes from, that a role's line height is not tightened, and that wrapped Thai at `display1` to `display3` collides where marks meet. Each request ran once with `main` as baseline (`982c9c0`) and with this change as revised, November 2026, through `run-claude-case.mjs --model claude-opus-5-5 --serve-registry --cap 1800` on Claude Code 2.1.322, with the runner's allowlist, permission note and browser tool. The revised arm ran twice, because the contract's wording changed after its first run:

- `67a59fa`: "Thai that wraps there collides, so check a Thai display heading in the browser."
- `a5b06dc`, as merged: "wrapped Thai collides there wherever a vowel below one line meets a mark above the next, so look at a wrapped Thai display heading in the browser and loosen only one that collides."

Fixture, in `.local/evals-fixtures/214/fund-app`: an app from `node scripts/smoke-new-app.mjs` at this change, so both arms start from the new type sizes and line heights and differ only in the package. Its one screen is a fund overview in Thai: the fund name at `text-title1`, its unit value, three `text-body` paragraphs of investment policy and a buy button, on mock data.

Requests, verbatim; each arm had its own port:

> /neon:neon-create The dev server for this app is already running at http://localhost:{port}. Add a hero section above the fund name with a big display heading that says “ลงทุนเพื่ออนาคตที่มั่นคงของคุณและผู้ที่คุณรัก เริ่มต้นวันนี้กับกองทุนที่ผู้เชี่ยวชาญคัดสรรให้” and one supporting line under it.

> /neon:neon-create The dev server for this app is already running at http://localhost:{port}. The investment policy paragraphs take too much vertical space on mobile. Tighten their line spacing so more of the text fits on one screen.

| | Baseline `982c9c0` | Revised `67a59fa` | Revised `a5b06dc` |
| --- | --- | --- | --- |
| Hero: heading's type | `text-title1`, `md:text-display3` at 54/64 | `text-title1`, `md:text-display3` with the line height raised to 76px | `text-title1`, `md:text-display3` at 54/64 |
| Hero: looked for Thai marks meeting | No: reports that the Thai "wraps without clipping" from the probe | Read the probe's screenshots; raised the line height before looking, "can overlap" | Zoomed into the 1440 screenshot, found no mark touching, kept 54/64 and says so |
| Hero: measured gap between the heading's lines at 1440 | 4px clear | 16px clear | 4px clear |
| Tighten: outcome | No change. Tried 20px in the browser, saw marks run into the next line, offered three other ways | No change. Cites the contract's rule and its 1.4 × rule, offered three other ways | No change. Cites the rule and "up to 2px", offered three other ways and tightening anyway with screenshots first |
| Files changed (hero, tighten) | `src/App.tsx`, none | `src/App.tsx`, none | `src/App.tsx`, none |
| Denied commands | None | None | Hero: one `cp … ; sips …` on a screenshot outside the workspace; the run went on and is not void |
| Cost (hero, tighten) | $0.55, $0.40 | $0.50, $0.35 | $0.48, $0.34 |
| Verdict | Unverified: the hero run never looked at the Thai marks; its page and the tighten run pass | Fail: the hero run loosened a heading that did not collide; the tighten run passes | Pass: both |

The first wording said wrapped Thai collides at the display roles without condition, and the run loosened the heading on that word alone. The heading it was given does not collide: measured afterwards in Chromium with the method of #214's evidence, its four lines at 54/64 clear by 4px, since no vowel below sits over a stacked mark in it. The wording was changed to say when it collides and to loosen only then; that run looked, found nothing and kept Core's line height. The tighten request shows no difference in outcome: `main` already declines, after trying it in the browser, and the revised package declines from the rule in fewer turns (16 against 19).

Limits:

- One sample per arm and wording, so each difference is what a package did once, not a rate.
- No request gave a heading whose marks do meet at a display role, so "loosens one that collides" was not exercised.
- The hero gaps were measured by this change's author with a script kept outside the repository (`.local/type-214/measure-heading.mjs`), not by the runs. The pages were otherwise graded on the report, the diff and that measurement, not on how they look.
- Both arms used an app that already holds the new line heights. An app on the earlier values (17/22 body) was not tried.
- The served registry is this checkout's.
