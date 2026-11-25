---
scenarios:
  - request: Build a Club Campaign Page for a members' tax talk with seat booking, with no Theme Brief and no images supplied
    observe: Designs its own layout without opening the campaign sections example, a Theme Brief or the functional patterns, then themes it; switching Immersive Theme recolors the page and moves nothing.
---

# Campaign sections example

> The run below predates [ADR 0018](../../../docs/adr/0018-the-agent-designs-campaign-pages-and-neon-themes-them.md), which retired the layout rules it measures. Only the scenario above is current.

What `neon-create` takes from [campaign sections](../../../examples/campaign-sections/README.md) after [campaign direction](../../../skills/neon-create/references/campaign-direction.md) links it. One request ran once on the package before the link as baseline (`bfac829`) and once with it as revised (`babdc5c`), 24 November 2026. `run-claude-case.mjs` stopped in both arms before any model call ("Not logged in"), so each arm was a fresh subagent given its package's `neon-create` in its own workspace.

Request, verbatim; the revised arm used port 5232:

> /neon:neon-create สร้าง landing page ใน ./tax-talk ให้สมาชิก Finnomena Club จองที่นั่งงานเสวนาวางแผนภาษีปลายปี วันพุธที่ 9 ธันวาคม 2569 เวลา 18:30–20:30 น. ที่ห้องประชุมชั้น 8 ของสำนักงาน เข้าฟรี รับ 80 คน มีวิทยากร 3 คน ใช้ธีม Club ใช้ข้อมูลตัวอย่าง ยังไม่มีรูป รัน dev server ที่ port 5231

| Item | Baseline | Revised |
| --- | --- | --- |
| Example files opened | None | README and `CampaignSections.tsx` |
| Sections, in order | Hero, seats, agenda, speakers, booking | Hero, agenda, speakers, terms and booking |
| Grounds, in order | White, palette 100, white, light tint, accent | White, palette 100, white, accent: the example's own sequence |
| Booking | A labelled placeholder | Acceptance, its error, and a booked state, as in the example |
| App source lines of over 30 characters identical to the example | 1, an import | 17: imports and generic classes, and also the hero's two-column, padding and image markup, the acceptance state and the label "ฉันอ่านและยอมรับเงื่อนไข" |
| Kept out of the page | Not applicable | The questions section, the 60-minute figure, the example's facts and its Patterns |
| Outside the request | A theme menu in the header | None seen |
| Verdict | Unverified: no example opened | Fail: sections and facts are its own, but hero markup, booking label and grounds are the example's |

The wording calling the example a reference rather than a template did not stop the copying.

Limits:

- One sample per arm, in subagents and not the harness; this repository's `AGENTS.md` was in their context.
- The evaluator wrote the link, knew the arms and judged by source overlap and full-page captures at 375 and 1440. No blind judge compared them.
- The agents' own checks were not repeated, and the booking states were read from the source and not exercised.
- Costs are not comparable.
