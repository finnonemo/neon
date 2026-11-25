# The agent designs Campaign Pages and Neon themes them

> Status: Accepted, 2026-11-25.

The owner asked on 2026-11-25: "ปรับ skill neon immersive layout ไม่ต้องตั้งกฎ layout , ให้เป็นหน้าที่ ai ที่ใช้อยู่ตอนนั้นในการออกแบบ ให้ใช้ความสามารถของ ai ที่กำลังใช้ในการสร้าง แล้ว neon จะแค่ theming เปลี่ยนสีตอนหลัง" (set no layout rules for immersive pages; the AI in use designs and builds with its own ability, and Neon only themes the color afterwards).

## Decisions

- **Neon sets no layout rule for a Campaign Page.** Composition, section order, type scale, spacing, shape, imagery and motion belong to the agent. This supersedes the composition, direction-line and Brand Pattern placement rules of `campaign-direction.md`, its first-screen and headline-line rules in `campaign-content.md`, and [ADR 0013](0013-campaign-pages-tell-a-story-with-named-scroll-patterns.md)'s motion budget and closed list of scroll patterns, which had rejected free composition.
- **Theming is a second step and changes color only.** The design's color variables are pointed at `--immersive-*` ([ADR 0005](0005-immersive-pages-start-from-a-guideline-theme.md) stands), so a theme switch recolors the page and moves nothing.
- **What stays is not layout:** the Brand Floor, contrast, reduced motion and content that never waits for a script, keyboard access, no invented proof, and how a Brand Pattern is drawn.
- **Derived from the request, not stated by the owner:** a Brand Pattern becomes optional; a Theme Brief is used only when the employee names or supplies one, and its layout is then a suggestion; type sizes and weights are the agent's, in IBM Plex Sans Thai.
- **Reference Designs are unchanged.** An employee who brings one has asked for its layout, so Brand Intensity still applies.

## Consequences

- The four published briefs still carry layout and motion sections, which the skill reads as suggestions. Redrawing them is separate work.
- `campaign-sections` stays as a reviewed example, and no skill links it.
- `ImmersiveLayout` is unchanged and optional.
- Pages will vary more between agents, and no review can judge a page by a composition rule.
