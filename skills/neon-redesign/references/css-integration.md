# CSS integration

Read when a CSS asset is missing or its integration must change. Existing usable tokens require no installation.

## CSS setup

For a whole-app integration, from the resolved Neon root:

```sh
node "<Neon root>/scripts/install.mjs" <target-dir> --css-only
```

The default output is `src/theme/theme.css`; `--theme-dir <project-relative-dir>` changes it. Import once through the app's existing CSS/entry mechanism. Match theme selectors to the app's mode owner before applying the asset globally.

For partial changes, reference existing in-scope variables first. If unavailable, copy only required canonical declarations into the target container, including applicable mode variants. A local override must not affect root consumers. Colors-only uses color variables, not font/space/radius declarations.

Customized assets must be diffed and merged; see [installer conflicts](../../neon-audit/references/theme-integration.md#installer-conflicts). Never delete them to force a clean copy. Inspect landed files after an I/O error before retrying.

## Typography expansion

The CSS asset contains typography and geometry variables, so reuse it when expanding from colors to the visual system. This still requires [font loading](../../neon-audit/references/theme-integration.md#font-loading), affected token application and wrapping/layout checks. It is not a zero-work upgrade.

## CDS adoption

Route authorized React/CDS adoption to `neon-create`. Matching variable names do not prove migration compatibility; perform the [CSS-to-CDS checks](../../neon-audit/references/theme-integration.md#css-to-cds-migration) before removing the CSS import.

## Adapter limits

The adapter omits spectrum primitives, illustration-specific tokens, icon/avatar sizing, shadows and mono font family; inspect its header for current coverage. Prefer existing semantic accent roles where appropriate, including colorful immersive content. Missing roles are not permission to invent brand values. Preserve structural geometry and existing shadows during colors-only work.

`theme/css/theme.css` is separately maintained. After a canonical mapping change, regenerate through `createNeonTheme()` and `createThemeCssVars()` using the procedure in its header; token generators do not update this adapter automatically. Ordinary app styling does not require regenerating the canonical adapter.
