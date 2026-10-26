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
 * Also exports `neonComponentConfig`, the per-scheme ComponentConfigProvider
 * value that points CDS's on-color text at `onColorLabel` (see
 * createComponentConfig below).
 *
 * Hand-written, not generated — neither part depends on Finnomena's specific
 * token values, only on neonTheme's/colorOverrides' shape and the token
 * `onColorLabel` names.
 */
import { defaultTheme } from "@coinbase/cds-web/themes/defaultTheme";
import type { ThemeConfig } from "@coinbase/cds-web";
import type { CSSProperties } from "react";
import type { ComponentConfigProviderProps } from "@coinbase/cds-web/system";

import { neonTheme } from "./theme.config";
import { colorOverrides, onColorLabel } from "./color-overrides";

type ComponentConfig = NonNullable<ComponentConfigProviderProps["value"]>;
type ColorScheme = keyof typeof onColorLabel;

const ON_COLOR_VARIANTS = new Set(["primary", "positive", "negative"]);

/** Sets the label color on filled colored button variants. */
function onColorButton(color: (typeof onColorLabel)[ColorScheme], defaultVariant: string) {
  return (props: { variant?: string; transparent?: boolean }) =>
    !props.transparent && ON_COLOR_VARIANTS.has(props.variant ?? defaultVariant) ? { color } : {};
}

/**
 * Where CDS uses fgInverse for on-color text and the scheme needs a different
 * token, point the components at it. Calendar's selected day and Avatar's
 * initial hardcode fgInverse, so they get the CSS variable redefined on the
 * element around that text instead of a color prop.
 *
 * Instance props still win, and the merge is shallow: a Calendar given its own
 * `styles`, or an Avatar given its own `style`, drops this override and must
 * include the variable itself.
 */
function createComponentConfig(scheme: ColorScheme): ComponentConfig {
  const color = onColorLabel[scheme];
  if (color === "fgInverse") return {};
  const fgInverse = { "--color-fgInverse": `var(--color-${color})` } as CSSProperties;
  // CDS types each entry as the component's BaseProps, which omit style props
  // such as DotCount's color, Calendar's styles and Avatar's style.
  // useComponentConfig merges every prop at runtime (verified against
  // @coinbase/cds-web@9.26.1), and the template browser suite checks the result.
  const config: Record<string, unknown> = {
    Button: onColorButton(color, "primary"),
    IconButton: onColorButton(color, "secondary"),
    Checkbox: { controlColor: color },
    DotCount: { color },
    DotSymbol: { color },
    Calendar: { styles: { day: fgInverse } },
    Avatar: { style: fgInverse },
  };
  return config as ComponentConfig;
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
