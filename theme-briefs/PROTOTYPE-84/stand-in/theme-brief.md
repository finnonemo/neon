# Theme Brief (PROTOTYPE stand-in for finnonemo/neon#84)

Read when: a Campaign Page has no Reference Design, or a file's first line is `# Finnomena <Theme> · <Brief name> — Theme Brief`.

A Theme Brief is Finnomena-authored, not a Reference Design: skip Brand Intensity and the reference procedure. The full Brand Contract applies. A Theme Brief start is on the Neon base (shadcn/ui, Radix, Tailwind v4, Neon's registry items in `src/components/ui`); build with those installed components, never with CDS. (Prototype: the brief is already at `docs/theme-briefs/`; skip the registry listing and match.)

## Steps

1. Read the brief end to end. Set the page root's `data-immersive-theme` to its `**Immersive Theme:**` value and import the app's `src/theme/immersive-themes.css`.
2. Take every value from installed CSS: colors from `--immersive-*`, type from Neon's roles (`--fontSize-*`, `--lineHeight-*`, `--fontWeight-*`), spacing and radius from `--space-*` and `--borderRadius-*` at the brief's Picks. Never copy a hex or px from the brief's tables.
3. Build the section sequence the Layout names, by role. Map the employee's claims onto those roles with the campaign-content rules: a role with no claim is dropped or merged, never filled with invented claims.
4. Components: Main Action is Neon `Button` on `--immersive-action`; Logo is the logo component if installed, else a labelled logo slot; Tint, Accent and Support Blocks are sections on the theme's steps. Build occasion components as page-local components from installed Neon items.
5. Imagery guides framing of supplied images. With none supplied, leave labelled image slots as pre-launch to-dos; invent nothing.
6. Brand Pattern: the vendored Block generator is not installed in this prototype, so give the named section its ground fill only and report that the pattern is missing. Never hand-draw or imitate it in CSS.
7. Motion: implement the brief's level within its vocabulary; `prefers-reduced-motion: reduce` falls back to still.
8. Add the brief's Do's and Don'ts to your verification checklist and check each one on the rendered page.
9. The employee's explicit request beats the brief; the Brand Contract beats both.

Done when the page builds, every section color is an `--immersive-*` pair, and each Do/Don't is checked on your own screenshots at 375 and 1440 wide.
