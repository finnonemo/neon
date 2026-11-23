# Reference screens stay private and lend only composition and behaviour

> Status: Accepted, 2026-11-23.

The owner collected 45 distinct screens of one third-party product family (Uber), as images in `resources/uber`, for Neon to create and review from. They were read one by one and the decision was made in a grilling session: three rounds, the first two answered "รับทุกข้อ", the last "ยืนยัน เริ่มเลย" on 2026-11-23. The product is not new to Neon: Core's hierarchy rules already take their look from it. What the images add is how a whole screen is put together and behaves.

## Decisions

- **The images are the maintainer's, never shipped.** `resources/` is ignored by git. What Neon keeps is written by Finnomena: the [pattern register](../design/pattern-register.md), which names no product and holds no image and no measured value. The table from pattern to image sits beside the images. ADR 0001 stands.
- **Only composition and behaviour are taken**: regions, order of information, interaction and states. Color, type, space, shape and components come from Core (ADR 0009, ADR 0011).
- **An allowed set, not a closed list.** An approved pattern needs no further approval to be used. A screen outside the set is still designed from `skills/INSTRUCTION.md`.
- **Where an image and Core or Neon differ, Core or Neon wins.** The register records each refused part and what is used instead. To have an image win, change the rule at its source first.
- **A review finding rests on a rule, never on an image.** A pattern can show that a composition is accepted, or be offered as a fix. Differing from a pattern is not a finding.
- **The hold of ADR 0015 is unchanged.** Until the web gate passes, functional patterns are maintainers' material: drafts stay in `.local/`, and nothing goes to the skills, the shell, the registry or `examples/`. Patterns for Campaign Pages are outside the hold and may ship once approved.
- **The images don't score the gate.** Core's ADR 0021 scores fidelity to a Brief and to Core's rules. These images answer no Brief, so scoring against them would measure likeness to another product.
- **The owner approves, by property**, at 375 and 1440, as [the example library](../design/example-library.md) asks.

## Considered

- **Ship the images:** rejected. They are another company's product and brand.
- **A closed list:** rejected. The images cover no investment chart, NAV or portfolio work.
- **An exception to the hold:** rejected. It would change functional screens before anything measures them.
- **Copy the images to `.local/`:** rejected. A worktree's `.local/` goes with the worktree.
