# Campaign Page rules are brand only

> Status: Accepted, 2026-11-25. Supersedes the "What stays" decision of [ADR 0018](0018-the-agent-designs-campaign-pages-and-neon-themes-them.md).

The owner asked on 2026-11-25 to draw out the AI's ability and have the skill control "เฉพาะส่วน branding ที่จำเป็นจริงๆ" (only the branding that is truly necessary), and: "เอากฎพวกนี้ออก contrast, motion ที่ปลอดภัย, การเข้าถึง, ห้ามแต่งข้อมูลด้วย" (also remove the rules on contrast, safe motion, access and invented content).

## Decisions

- **Neon rules on four things on a Campaign Page:** the logo, the typeface, the color and how a Brand Pattern is drawn. The Brand Floor no longer names contrast.
- **No contrast, motion safety, access or truth rule on a Campaign Page.** These are left to the agent's judgment. the campaign content reference is removed. Functional screens keep every one of them.
- **The prompt asks for ambition.** A one-line request, "go all out", and a brand file that sets the look and not the ambition come from [an article the owner supplied](https://charliehills.substack.com/p/claude-code-motion-graphics), with its advice to check frames against the brand file, use real product components, and take each note as naming one change. Its fixed timing and motion values, and asking about whatever the file leaves open, are not taken: both would limit the design again.
- **Derived, not stated by the owner:** the [readiness](../../skills/neon-audit/references/readiness.md) gate for shipping is kept, with its Investment Content, personal data and placeholder rules, because it is a compliance gate and not a design rule. It drops its reduced motion item.

- **`neon-review` follows.** The owner chose brand only for Campaign Page reviews too: brand and visible breakage, with accessibility checked only when the request asks.

## Consequences

- A Campaign Page can ship with unreadable text, motion that ignores `prefers-reduced-motion`, controls a keyboard cannot reach, or invented quotes and counts, and no Neon check stops it. The owner or employee reviews the page.
- Earlier eval records that measured these rules on Campaign Pages keep their results as history.
