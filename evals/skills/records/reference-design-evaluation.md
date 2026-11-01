---
scenarios:
  - request: Build a Finnomena event landing page from an attached Refero reference design
    observe: Starts at Blended without asking; keeps reference geometry; Finnomena palette, IBM Plex Sans Thai and logo; no source-brand name, copy or imagery; offers the dial
  - request: Build a Finnomena landing page from a reference design whose hero uses a multi-hue gradient
    observe: Keeps the gradient's placement and direction; its stops become a gradient recipe from `theme/tokens/colors.json`; no reference hue survives; hero text is readable at every stop beneath it
  - request: "Follow-up: \"ให้ดู finnomena มากขึ้น\""
    observe: Moves exactly one level toward Finnomena-led; content, flow and composition unchanged
  - request: "Follow-up: \"use the reference's own colors and font\" at Reference-led"
    observe: Stays at Reference-led and explains the Brand Floor; reference colors may stay with at least one Finnomena color; no source font
  - request: Reference-led dark immersive event page; follow-up "change the yellow CTA to a white button"
    observe: White action with a dark label; no navy or yellow forced back; IBM Plex Sans Thai and at least one Finnomena color remain; the shared theme mapping is untouched
  - request: Back office screen; "make the primary button white"
    observe: "Functional contract: primary action stays navy; explains that white actions are for immersive surfaces"
  - request: Review a Reference-led immersive page with a white CTA and no navy or yellow
    observe: No off-brand finding for the action or palette; contrast is still checked
  - request: Build an immersive campaign dashboard "in this style" from one screenshot, no stated target
    observe: Shows 2–3 static directions before building; saves the screenshot with a note; builds only the picked direction
  - request: "Follow-up after a rejected build: \"ยังไม่ใช่ที่ต้องการ\""
    observe: Returns to 2–3 directions rather than another full rebuild
  - request: Attach a reference design to a back office screen request
    observe: Functional contract; takes at most section structure; does not offer the dial
---

# Reference design evaluation

See [the reference design protocol](../reference-design-protocol.md) for the Brand Intensity matrix. Third-party reference designs and generated pages stay under `.local/`.

October 2026, Codex, one sample per revision. The fixture holds `./DESIGN.md`, a synthetic dark style for an invented brand, Lumora: lime `#C6FF3D` actions, ultraviolet accent, Space Grotesk "installed from Google Fonts", 2px radius, fade-up motion and the line "See further.". Any of those brand strings in the output is a Brand Floor leak.

- **Landing page** ("using ./DESIGN.md as the reference design"). Before (main): did not read a reference procedure; `#c6ff3d` appears 18 times, plus `#7a5cff` and Space Grotesk, and the report says "the reference's dark styling". Fail. After: read the reference design procedure; no Lumora strings; kept the reference's timeline and fade-up motion (24px, 400ms, 80ms stagger); the report names what came from the reference and offers a more Finnomena-led or reference-led look. Pass on the Brand Floor and the dial offer.
- **Back office screen** with the same file "as a reference". Before and after: no Lumora strings and no dial offered. After also read the reference design procedure. Pass both; no measurable difference.

Limits: one sample each, Codex only, source text inspected rather than rendered screens (browser checks were blocked by the sandbox), the 2px radius did not visibly carry over so Blended geometry is only partly shown, follow-up dial moves and Reference-led were not run, and the reference is synthetic rather than a Refero style.

November 2026: [ADR 0004](../../../docs/adr/0004-immersive-pages-keep-a-thin-brand-floor.md) thinned the Brand Floor to the logo, IBM Plex Sans Thai and at least one Finnomena color, with white actions allowed on immersive pages. Decision walkthroughs, 1 November 2026, Claude (general-purpose subagents), one sample each, against the uncommitted revision for #70. Fresh agents read the installed skills and reported files read, decisions and the lines behind them; nothing was built or rendered.

- **White CTA follow-up** on a dark campaign page: white fill, navy label, a 3:1 boundary only on light sections, change kept in the page's existing scoped mechanism, shared theme untouched. Pass. It noted that neon-create's "colors-only … follows neon-redesign" line pulls against staying on the CDS path.
- **Back office "make the primary button white"**: keeps the shared primary navy, asks one scope question, offers only a local exception with a dark label and boundary. Pass.
- **Review of a white-CTA immersive page** with no navy or yellow: no brand finding; indigo-on-charcoal contrast listed as unverified. Pass.
- **"This style" from one telemetry screenshot**, empty folder: three static mockups before any build, screenshot saved with a note, source logos, photos and typeface dropped. Pass. It found that saving the reference before scaffolding makes the installer refuse the folder; the rule now saves after scaffolding.
- **"ยังไม่ใช่ที่ต้องการ" after two rejected builds**: no fourth rebuild; three distinct static directions and rereads the saved note. Pass.

Limits: one sample per case, one model, decisions only; no app was built, so visual quality and the mockups themselves are unverified.

The gradient scenario added with the gradient recipes (November 2026) has not been run; only `gradient-recipes.test.mjs` checks the recipe table against the token export and its contrast claims.
