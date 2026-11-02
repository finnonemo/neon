# Add an Immersive Theme

## Read when

Read this before you add an Immersive Theme. To change a theme's colors without adding one, edit `theme/immersive-themes.json`, then follow steps 3, 6 and 8. Check 11 then requires the new theme's text and at least one published brief, so add the theme and its baseline brief in one PR.

## Steps

1. **Basis.** Get the guideline section and the design owner's approval for the theme. The four themes come from the guideline's membership levels ([ADR 0005](../../adr/0005-immersive-pages-start-from-a-guideline-theme.md)). A theme outside them, such as one on a secondary-color canvas, needs a new ADR first.
2. **Theme data.** Add the theme to `theme/immersive-themes.json` as `Family.step` references to `theme/tokens/colors.json`. Check every background and text pair before you call it readable:

   ```sh
   node scripts/contrast.mjs <text> <background>
   ```

3. **CSS and component.** Run `node theme/scripts/generate-immersive-themes.mjs` to regenerate `theme/css/immersive-themes.css`. Add the theme's id to the `ImmersiveTheme` type in `registry/layout/ImmersiveLayout.tsx`. Then run `node scripts/build-registry.mjs`, since the Immersive Themes item inlines the CSS.
4. **Theme text.** Write `theme-briefs/themes/<theme>.json` with its `mood` (2–4 sentences) and `sibling` line (20 words or fewer). Describe the theme on its own terms, with no ratio, superlative or comparison with another theme.
5. **Baseline brief.** Add `theme-briefs/picks/<theme>-<slug>.json` for the brief every theme carries, with the same presets and brief name as the others. Choose a colourway and ground that fit the theme: a Pattern sits on the bare canvas only as `palette` 100. Run the tool, then [review and publish](../theme-briefs.md#review-and-publish) the brief.
6. **Existing briefs.** Every brief lists the other themes under Sibling Themes, so refresh them all:

   ```sh
   node scripts/theme-briefs/theme-briefs.mjs scripted-only
   ```

   Then run `node scripts/build-registry.mjs` again, since each brief item inlines its Markdown.
7. **Prose that counts the themes.** Update every place that names the themes or their number: `GLOSSARY.md`, `skills/INSTRUCTION.md`, the skills, and the Immersive Themes item's description in `registry/registry.json`. Search for the existing theme names to find them.
8. **Validate.** Run `check-only`, `node scripts/validate.mjs` and `node scripts/smoke-new-app.mjs`. Then check a page on the new theme by eye: static checks cannot establish how it reads.
