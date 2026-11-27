# Approved functional patterns reach the skills and examples before the web gate

> Status: Accepted, 2026-11-28.

The owner wants Neon's skills to lay out finance pages better now: where a chart, its range and the buttons go, how an order form and a money move run. [ADR 0015](0015-neon-holds-at-bug-fixes-until-the-web-gate.md) holds functional screens at bug fixes until Core's web gate passes, and no client and model pair has passed it yet. [ADR 0017](0017-reference-screens-stay-private-and-lend-only-composition.md) keeps the patterns drawn from reference screens in `.local/` for the same reason. Decided in a grilling session on 2026-11-27: scope "Approved patterns", reach "skills/ + examples/", and where the finance page rules are written: "ไม่ต้องทำที่ core แล้ว ทำที่ neon อย่างเดียว", which the owner confirmed was the answer to that question ("หมายถึงข้อนี้ ทำ neon").

## Decisions

- **An approved functional pattern may reach `skills/` and `examples/` before the gate.** Approved means the owner approved its composition and interaction by property at 375 and 1440, as [the example library](../design/example-library.md) records it. P1 to P13 are approved; P14 to P16 reach the skills once each is.
- **Nothing else moves.** The shell, the layouts and the registry stay held, so an app's shell still changes once, at the rebuild after the gate. An example builds from today's layouts and registry items; what it needs that they lack (a chart, a dock inside content) is drawn in the example, not added to the registry.
- **The owner's approval is what measures the change.** ADR 0015 held Neon because nothing scored a web screen. A pattern that reaches a skill this way has been looked at by the owner at both widths, in light and dark, and its example runs in the browser suite (layout and axe checks). That is less than the gate's score, and the skill text says the pattern is an approved default, not a template.
- **Core's docs still win.** A rule a Core doc already states is cited, not restated: the chart's period selector and scrubbing read-out ([line chart](../../core/components/line-chart.md) when the snapshot carries it), the Button dock, the Sheet. Where a reference screen and Core differ, the register's refused parts stand.
- **The rules are written in Neon, not first in Core** (the owner, 2026-11-27). ADR 0015's line that rules holding on both targets move to Core after the pilot is unchanged: when it happens, these move with them.
- **ADR 0017 changes one line.** Its hold ("drafts stay in `.local/`, and nothing goes to the skills, the shell, the registry or `examples/`") now lets an approved pattern into the skills and `examples/`. Reference images, their notes and the product's name still never leave the maintainer.

## Considered

- **Wait for the gate:** rejected by the owner; finance layouts are wanted now.
- **Write the rules in Core's Blueprints first:** rejected by the owner. It needed a paid eval per change and a compile that does not yet carry Blueprints to Neon.
- **Let drafts in before approval:** rejected. A pattern no one has approved would become every employee's default.
- **Add a chart and an order form to the registry:** rejected for now; it changes what the shell rebuild must carry.
