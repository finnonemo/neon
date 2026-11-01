# Gradients come from palette recipes; a reference keeps a gradient's shape, not its colors

Campaign Pages may use gradients, but only Gradient Recipes built from `theme/tokens/colors.json` steps: tint fade, navy depth and field to navy. These come from the patterns in Finnomena's own KKP, Tax, Club and Port campaign files. A Reference Design's gradient keeps its placement, direction and coverage wherever its geometry survives under Brand Intensity. Its stops are brand, so they always become a recipe, except that Reference-led may keep a gradient made only of the reference's neutral surface colors. Text and actions must meet contrast against every stop beneath them, because a gradient that passes at one end can fail at the other: on the KKP hero, white text is 18.12:1 on the navy end but 2.46:1 on the lavender top. The recipes stay provisional and page-scoped until a design owner approves theme-level gradient tokens.

## Considered Options

- **Free gradients from any palette hex**: rejected. Two palette steps chosen ad hoc pass the "palette-based" wording but give agents no on-brand shape and no contrast check.
- **Copy the designers' exact stops**: rejected. Several stops in the campaign files (for example `#635f98`, `#a3a3bd`, `#66717a`) are not in the token export. An agent adding them would invent brand values. They go to the design owner as a token-export question instead.
- **Keep a reference's gradient colors at Blended**: rejected. Gradient hues carry the source brand as strongly as its accent color does.

## Open questions

These are deferred to the design owner and are not decided here: the campaign typeface (the Brand Floor says IBM Plex Sans Thai, while the campaign files use Finnomena Trek and Aktiv Grotesk Thai), radial or conic recipes and gradient text, co-brand partner logos and colors, whether the colors-only tier caps Brand Intensity, and whether presentations become a work type under ADR 0002.
