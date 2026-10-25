# Starter browser regressions

Maintainer-only tests; nothing in this directory ships with the plugin.

```sh
npm ci --prefix evals/templates
cd evals/templates
npx playwright install chromium
npm test
```

The runner assembles into a fresh OS temporary directory, installs the starter's locked dependencies and builds the untouched app. It then copies fixture source and the actual integration reference into that disposable app, builds again, and runs Chromium against its production preview. The temporary app is removed on success or failure. Tests use no backend or real records.

The fixture covers both controlled and uncontrolled content/detail navigation, state and scroll retention, focus return, breakpoint transitions, all five layouts' navigation space, empty navigation, computed icon contrast, font loading, and the integration example's styles and logo behavior. Tests inject a nonzero safe-area value through the same custom property used by the device inset; this does not certify physical-device behavior.

Reports, screenshots and failure traces go to `.local/evals/templates/` in the repository and are uploaded by CI. Inspect screenshots for Thai/English wrapping and layout quality; successful assertions alone do not establish visual quality. This suite does not evaluate a host's skill selection or conversation persistence.
