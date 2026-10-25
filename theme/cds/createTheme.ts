/**
 * Merges `neonTheme` (theme.config.ts's generated overrides) and
 * `colorOverrides` (color-overrides.ts's hand-written, provisional color
 * mapping) onto @coinbase/cds-web's own `defaultTheme` to produce a real,
 * complete ThemeConfig — ThemeProvider's `theme` prop requires the full
 * shape, and there's no first-party merge utility in @coinbase/cds-web/
 * cds-common/cds-utils to do this for us (confirmed by inspecting the
 * published package — createThemeCssVars formats a theme as CSS vars,
 * diffThemes only subtracts, neither merges).
 *
 * `defaultTheme` is reachable via the package's wildcard export
 * (`@coinbase/cds-web/themes/defaultTheme`) rather than one of its
 * documented named subpaths — verified against @coinbase/cds-web@9.26.1.
 *
 * Hand-written, not generated — this merge logic doesn't depend on
 * Finnomena's specific token values, only on neonTheme's/colorOverrides'
 * shape.
 */
import { defaultTheme } from "@coinbase/cds-web/themes/defaultTheme";
import type { ThemeConfig } from "@coinbase/cds-web";
import type { ComponentConfigProviderProps } from "@coinbase/cds-web/system";

import { neonTheme } from "./theme.config";
import { colorOverrides, onColorButtonLabel } from "./color-overrides";

type ComponentConfig = NonNullable<ComponentConfigProviderProps["value"]>;
type ColorScheme = keyof typeof onColorButtonLabel;

const ON_COLOR_VARIANTS = new Set(["primary", "positive", "negative"]);

/** Sets the label color on filled colored variants; a `color` prop on the instance still wins. */
function onColorLabel(scheme: ColorScheme, defaultVariant: string) {
  return (props: { variant?: string; transparent?: boolean }) =>
    !props.transparent && ON_COLOR_VARIANTS.has(props.variant ?? defaultVariant)
      ? { color: onColorButtonLabel[scheme] }
      : {};
}

function createComponentConfig(scheme: ColorScheme): ComponentConfig {
  return {
    Button: onColorLabel(scheme, "primary"),
    IconButton: onColorLabel(scheme, "secondary"),
  };
}

/**
 * Pass `neonComponentConfig[activeColorScheme]` to CDS's
 * ComponentConfigProvider, inside ThemeProvider. Both entries are created
 * once here, so the provider value keeps a stable identity per scheme.
 */
export const neonComponentConfig: Record<ColorScheme, ComponentConfig> = {
  light: createComponentConfig("light"),
  dark: createComponentConfig("dark"),
};

/** One-level-deep field merge — sufficient since every ThemeConfig field is a flat map. */
function mergeFields(base: Record<string, unknown>, overrides: Record<string, unknown>): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    const baseValue = base[key];
    merged[key] =
      value && typeof value === "object" && !Array.isArray(value) && baseValue && typeof baseValue === "object"
        ? { ...baseValue, ...value }
        : value;
  }
  return merged;
}

export function createNeonTheme(): ThemeConfig {
  let merged: Record<string, unknown> = { ...defaultTheme };
  merged = mergeFields(merged, neonTheme);
  merged = mergeFields(merged, colorOverrides);
  return merged as ThemeConfig;
}
