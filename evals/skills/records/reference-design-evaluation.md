# Reference design evaluation

See [the reference design protocol](../reference-design-protocol.md) for the Brand Intensity matrix. Third-party reference designs and generated pages stay under `.local/`.

October 2026, Codex, one sample per revision. The fixture holds `./DESIGN.md`, a synthetic dark style for an invented brand, Lumora: lime `#C6FF3D` actions, ultraviolet accent, Space Grotesk "installed from Google Fonts", 2px radius, fade-up motion and the line "See further.". Any of those brand strings in the output is a Brand Floor leak.

- **Landing page** ("using ./DESIGN.md as the reference design"). Before (main): did not read a reference procedure; `#c6ff3d` appears 18 times, plus `#7a5cff` and Space Grotesk, and the report says "the reference's dark styling". Fail. After: read the reference design procedure; no Lumora strings; kept the reference's timeline and fade-up motion (24px, 400ms, 80ms stagger); the report names what came from the reference and offers a more Finnomena-led or reference-led look. Pass on the Brand Floor and the dial offer.
- **Back office screen** with the same file "as a reference". Before and after: no Lumora strings and no dial offered. After also read the reference design procedure. Pass both; no measurable difference.

Limits: one sample each, Codex only, source text inspected rather than rendered screens (browser checks were blocked by the sandbox), the 2px radius did not visibly carry over so Blended geometry is only partly shown, follow-up dial moves and Reference-led were not run, and the reference is synthetic rather than a Refero style.

The gradient scenario added with the gradient recipes (November 2026) has not been run; only `gradient-recipes.test.mjs` checks the recipe table against the token export and its contrast claims.
