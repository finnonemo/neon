# CDS integration

Read only when changing theme, providers, dependencies or token configuration. A working Finnomena app adding a feature skips this setup.

## Prepare and install

Inspect the target manifest/lockfile, relevant entry and current providers. Reuse active installation; check actual installed types and version compatibility before changing dependencies. A major-version mismatch is a migration decision. New projects use [scaffold](scaffold.md), not this existing-app procedure.

From the resolved Neon root, when theme installation is needed:

```sh
node "${CLAUDE_PLUGIN_ROOT}/scripts/install.mjs" <target-dir>
```

This copies four canonical CDS theme files and installs CDS if absent; it does not wire providers or replace component code. `--theme-dir <project-relative-dir>` changes the default `src/theme`; `--package-manager` selects the manager; `--skip-install` leaves dependencies pending. See the installer header for exact semantics.

Customized destination files are protected. Use [conflict handling](../../neon-audit/references/theme-integration.md#installer-conflicts), not deletion or a fabricated force flag. After an I/O failure, inspect partial writes before retrying.

## Theme and providers

Use a stable module-scope `createNeonTheme()` result, not unmodified CDS `defaultTheme` or a new theme object on every render. Derive `activeColorScheme` from the app's existing owner. Reuse its provider tree and preserve the documented order:

```text
MediaQueryProvider → ThemeProvider → ComponentConfigProvider → PortalProvider
```

Pass `neonComponentConfig[activeColorScheme]` from `createTheme.ts` to `ComponentConfigProvider`; without it, filled primary, positive and negative button labels are near-black on dark Navy in dark mode. If the app already has a `ComponentConfigProvider`, merge Neon's `Button` and `IconButton` entries into its value instead of nesting a second provider.

Use [app-entry.tsx](../../../theme/examples/app-entry.tsx) as the concrete integration example. For server-rendered apps read [SSR boundaries](../../neon-audit/references/project-inspection.md#server-rendered-react). For mode changes read [theme-mode ownership](../../neon-audit/references/theme-integration.md#theme-mode-ownership). Avoid a duplicate theme or font-loading mechanism.

## Component APIs and tokens

Prefer official CDS tooling when available; otherwise inspect installed exports and prop types. Verify current APIs rather than assuming a remembered token inventory.

Use semantic keys such as `color="fg"`, `padding={2}` and `borderRadius="200"` where supported by the installed package. Do not invent `textPrimary`, `medium` or `sm` for those props. Branded spacing/radius/color values reuse tokens; structural dimensions can use documented geometry. Preserve existing geometry unless composition adaptation is requested.

Component-specific defaults use supported `ComponentConfigProvider` configuration or scoped wrappers rather than changing a global token for one component. Custom theme keys require the supported `ThemeVarsExtended` declaration, not untyped properties bolted onto the theme.

Mapping in [color-overrides.ts](../../../theme/cds/color-overrides.ts) is provisional. Report relevant missing/conflicting roles rather than inventing a palette. When adopting CDS from CSS, perform [migration checks](../../neon-audit/references/theme-integration.md#css-to-cds-migration) before removing old declarations. For fonts, read [font loading](../../neon-audit/references/theme-integration.md#font-loading) only when its configuration or typography changes.
