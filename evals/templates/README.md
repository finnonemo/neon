# Starter browser regressions

Maintainer-only tests; nothing in this directory ships with the plugin.

```sh
npm ci --prefix evals/templates
cd evals/templates
npx playwright install chromium
npm test
```

The runner assembles into a fresh OS temporary directory, installs the starter's locked dependencies and builds the untouched app. It then copies fixture source and the actual integration reference into that disposable app, builds again, and runs Chromium against its production preview. The temporary app is removed on success or failure. Tests use no backend or real records.

The fixture covers both controlled and uncontrolled content/detail navigation, state and scroll retention, focus return, breakpoint transitions, Detailed and Content Layout pane widths at the min and max of every desktop tier, all five layouts' navigation space, empty navigation, computed icon contrast, text on colored fills (buttons, checkbox, selected calendar day, dots and avatar initial under the starter and integration provider roots, light and dark), Tag and Avatar text contrast on every spectrum fill Neon overrides, the merged theme's keys and value formats against CDS's `defaultTheme`, font loading, and the integration example's styles and logo behavior. Tests inject a nonzero safe-area value through the same custom property used by the device inset; this does not certify physical-device behavior.

`cds-match.spec.mjs` holds the Neon base to the CDS starter. Two fixture screens (approval, and extras with its overlays measured open) are measured at 375 and 1440, light and dark, into `fixtures/cds-baseline.json`: sizes within ±1px, type, colors, paddings, radii, borders and neighbor gaps. [measure.mjs](measure.mjs) lists every measured element with one selector per target, never a text search. Against the CDS app the spec checks that the baseline still holds; `npm run baseline` recaptures it after an intended CDS fixture or theme change.

Reports, screenshots and failure traces go to `.local/evals/templates/` in the repository and are uploaded by CI. Inspect screenshots for Thai/English wrapping and layout quality; successful assertions alone do not establish visual quality.
