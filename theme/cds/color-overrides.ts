/**
 * colorOverrides — Finnomena's provisional color mapping onto CDS's
 * ThemeConfig color fields (lightSpectrum/darkSpectrum, lightColor/
 * darkColor). Hand-written, NOT generated — this is a real design decision
 * (which Finnomena role plays which CDS semantic slot), not a mechanical
 * data transform. See ../../skills/INSTRUCTION.md's "Color roles" section
 * for the named brand roles this draws from, and ./color-mapping.todo.md (generated) for
 * the full reference dump of what every Finnomena semantic token resolves
 * to, which this file's assignments were built from.
 *
 * ⚠ PROVISIONAL — first-pass mapping for design review, not a final
 * sign-off. Every value below is traceable to a real Finnomena token (cited
 * in its own comment), not invented, but WHICH Finnomena role fills WHICH
 * CDS slot is a judgment call — flag any that look wrong to the design
 * owner rather than assuming they're settled.
 *
 * Values are copied verbatim from the current tokens/colors.json export.
 * If that export changes, re-derive these by hand — this file is not
 * regenerated automatically (unlike theme.config.ts), specifically so a
 * re-sync never silently overwrites a human review of these choices.
 *
 * Key judgment calls made here, stated explicitly:
 * - Navy Ink fills CDS's "primary" concept (fgPrimary/bgPrimary) — per
 *   Finnomena's brand framing, Navy is Finnomena's structural "ink" color
 *   that plays the role black/primary plays in most systems, not a
 *   generic accent.
 * - Indigo Interactive (links/focus) fills bgLinePrimary instead, since
 *   Finnomena has two distinct "primary-ish" roles (Navy for buttons,
 *   Indigo for links/focus) that don't cleanly collapse onto CDS's smaller
 *   slug set.
 * - accentSubtleGray/accentBoldGray are filled from Navy, not Finnomena's
 *   separate Grey family — Navy plays the neutral/structural role a gray
 *   scale normally would in this system. CDS's "gray" spectrum hue itself
 *   is not overridden (see "Explicitly left unassigned" below).
 * - Spectrum steps 60–100 are not same-numbered copies: they start at each
 *   hue's lightest Finnomena shade with ≥4.5:1 against white, so text CDS
 *   draws on or in them stays readable. Yellow 60–100 come out olive to
 *   black, and steps 50→60 jump from tint to shade — flag these to the
 *   design owner. Details in the Spectrum block below.
 * - Finnomena's primitive palette (tokens/colors.json) is NOT mode-branched
 *   — the same hex value exists regardless of light/dark. Where a slug has
 *   no distinct light vs. dark Finnomena semantic role, the same value is
 *   reused for both rather than inventing a synthetic inversion (CDS's own
 *   spectrum does invert per-mode, but nothing in Finnomena's export
 *   justifies fabricating that here).
 *
 * Explicitly left unassigned (falls through to CDS's own default via
 * createTheme.ts's merge) because no single confident Finnomena source
 * exists — do not fill these in without a real source, just to complete
 * the set:
 * - bgSecondaryWash, bgLineHeavy, bgLinePrimarySubtle — no Finnomena role
 *   names a value for these specific concepts.
 * - darkColor.bgNegativeWash / bgPositiveWash / bgWarningWash — Finnomena's
 *   own export has a known data gap here: all
 *   dark-mode Notifications and Status tokens resolve to flat white. Rather
 *   than propagate that broken value, these are left at CDS's default.
 * - lightSpectrum/darkSpectrum's gray, pink, chartreuse hues — no
 *   Finnomena family maps to any of these; CDS's own default spectrum
 *   values apply.
 */

const NAVY_100 = "rgb(1,23,43)"; // Navy Ink — Button.button-primary (light)
const NAVY_100_DARK = "rgb(65,81,96)"; // Navy Ink — Button.button-primary (dark)
const NAVY_5 = "rgb(242,243,244)"; // Navy Fog-adjacent wash — Navy.5 primitive (mode-independent)
const INDIGO_65 = "rgb(105,104,239)"; // Indigo Interactive — Focus.focus (same both modes)
const YELLOW_100 = "rgb(242,249,60)"; // Yellow Signal — Background.background-brand / Button.button-highlight (same both modes)
const ORANGE_100 = "rgb(242,100,20)"; // Support.support-warning (same both modes)

export const lightColor = {
  currentColor: "currentColor",
  fg: "rgba(0,0,0,0.851)", // Text.text-primary
  fgMuted: "rgba(0,0,0,0.651)", // Text.text-secondary
  fgInverse: "rgb(255,255,255)", // Text.text-inverse
  fgPrimary: NAVY_100,
  fgWarning: ORANGE_100,
  fgPositive: "rgb(0,150,70)", // Text.text-positive
  fgNegative: "rgb(214,8,8)", // Text.text-negative
  bg: "rgb(255,255,255)", // Background.background-primary (Paper White)
  bgAlternate: "rgb(242,242,242)", // Background.background-secondary
  bgInverse: "rgb(0,0,0)", // Background.background-inverse
  bgOverlay: "rgba(0,0,0,0.2)", // Miscellaneous.overlay
  bgElevation1: "rgb(255,255,255)", // Layer.layer-01
  bgElevation2: "rgb(255,255,255)", // Layer.layer-02
  bgPrimary: NAVY_100,
  bgPrimaryWash: NAVY_5,
  bgSecondary: "rgb(242,242,242)", // Background.background-secondary
  bgTertiary: "rgb(255,255,255)", // Background.background-tertiary
  bgNegative: "rgb(214,8,8)", // Button.button-danger family (Red.125)
  bgNegativeWash: "rgb(255,245,245)", // Notifications.notification-error-background
  bgPositive: "rgb(0,173,80)", // Support.support-success
  bgPositiveWash: "rgb(230,253,240)", // Notifications.notification-success-background
  bgWarning: ORANGE_100,
  bgWarningWash: "rgb(254,247,243)", // Notifications.notification-warning-background
  bgLine: "rgba(0,0,0,0.051)", // Border.border-subtle
  bgLineInverse: "rgb(255,255,255)", // Border.border-inverse
  bgLinePrimary: INDIGO_65,
  accentSubtleRed: "rgb(255,245,245)", // Red.5
  accentBoldRed: "rgb(247,50,50)", // Red.100
  accentSubtleGreen: "rgb(230,253,240)", // Green.10
  accentBoldGreen: "rgb(0,231,107)", // Green.100
  accentSubtleBlue: "rgb(246,253,255)", // Blue.5
  accentBoldBlue: "rgb(80,207,255)", // Blue.100
  accentSubtlePurple: "rgb(251,246,252)", // Purple.5
  accentBoldPurple: "rgb(170,70,195)", // Purple.100
  accentSubtleYellow: "rgb(254,255,245)", // Yellow.5
  accentBoldYellow: YELLOW_100,
  accentSubtleGray: NAVY_5,
  accentBoldGray: NAVY_100,
  transparent: "rgba(255,255,255,0)",
} as const;

export const darkColor = {
  currentColor: "currentColor",
  fg: "rgb(255,255,255)", // Text.text-primary (dark)
  fgMuted: "rgba(255,255,255,0.651)", // Text.text-secondary (dark)
  fgInverse: "rgba(0,0,0,0.851)", // Text.text-inverse (dark)
  fgPrimary: NAVY_100_DARK,
  fgWarning: ORANGE_100,
  fgPositive: "rgb(0,196,91)", // Text.text-positive (dark)
  fgNegative: "rgb(243,9,9)", // Text.text-negative (dark)
  bg: "rgb(0,0,0)", // Background.background-primary (dark, Paper White inverted)
  bgAlternate: "rgb(26,26,26)", // Background.background-secondary (dark)
  bgInverse: "rgb(255,255,255)", // Background.background-inverse (dark)
  bgOverlay: "rgba(0,0,0,0.502)", // Miscellaneous.overlay (dark)
  bgElevation1: "rgb(26,26,26)", // Layer.layer-01 (dark)
  bgElevation2: "rgb(51,51,51)", // Layer.layer-02 (dark)
  bgPrimary: NAVY_100_DARK,
  bgPrimaryWash: NAVY_5, // Navy primitive is mode-independent — no distinct dark wash role exists
  bgSecondary: "rgb(26,26,26)", // Background.background-secondary (dark)
  bgTertiary: "rgb(38,38,38)", // Background.background-tertiary (dark)
  bgNegative: "rgb(243,9,9)", // Text.text-negative family (dark, Red.115)
  // bgNegativeWash: omitted — dark-mode Notifications.* is a known Finnomena
  // export data gap (see header comment), all resolve to flat white; falls to
  // CDS default rather than propagating that.
  bgPositive: "rgb(0,173,80)", // Support.support-success (same both modes)
  // bgPositiveWash: omitted, same dark-mode data gap as bgNegativeWash.
  bgWarning: ORANGE_100,
  // bgWarningWash: omitted, same dark-mode data gap.
  bgLine: "rgba(255,255,255,0.149)", // Border.border-subtle (dark)
  bgLineInverse: "rgb(0,0,0)", // Border.border-inverse (dark)
  bgLinePrimary: INDIGO_65, // Focus.focus (same both modes)
  accentSubtleRed: "rgb(255,245,245)", // Red primitive is mode-independent
  accentBoldRed: "rgb(247,50,50)",
  accentSubtleGreen: "rgb(230,253,240)",
  accentBoldGreen: "rgb(0,231,107)",
  accentSubtleBlue: "rgb(246,253,255)",
  accentBoldBlue: "rgb(80,207,255)",
  accentSubtlePurple: "rgb(251,246,252)",
  accentBoldPurple: "rgb(170,70,195)",
  accentSubtleYellow: "rgb(254,255,245)",
  accentBoldYellow: YELLOW_100,
  accentSubtleGray: NAVY_5,
  accentBoldGray: NAVY_100,
  transparent: "rgba(0,0,0,0)",
} as const;

/**
 * Spectrum — populated only for the 8 CDS hues with a same-named Finnomena
 * family. "gray", "pink", "chartreuse" have no Finnomena source family and
 * are left out — CDS's own defaults apply.
 *
 * Finnomena families run 0 (white) → 100 (pure hue) → 200 (black); CDS's
 * run 0 → 100 from wash to deep. Steps 0–50 copy the same-numbered Finnomena
 * tint. Steps 60–100 start at the lightest Finnomena shade with ≥4.5:1
 * against white, then go 10 Finnomena steps darker per CDS step (source
 * steps cited per hue). CDS draws text on or in these steps — Tag pairs
 * step 0 with blue/green/red 60, purple 80 and yellow 70 (yellow 30 when
 * high emphasis), and Avatar puts its initial on step 60 — so the
 * same-number tints (as pale as 1.1:1) left that text unreadable. The ≥4.5:1
 * rule is a contrast floor, not a design sign-off;
 * evals/skills/theme-spectrum.test.mjs checks it.
 *
 * Light and dark are identical: Finnomena's primitive palette is not
 * mode-branched (unlike CDS's own spectrum, which inverts per mode) — using
 * the same absolute values for both is the honest reflection of the source
 * data, not a shortcut.
 */
const spectrum = {
  // 60–100 ← Blue.150–190
  blue: { 0: "255,255,255", 5: "246,253,255", 10: "238,250,255", 15: "229,248,255", 20: "220,245,255", 30: "203,241,255", 40: "185,236,255", 50: "168,231,255", 60: "0,122,168", 70: "0,97,134", 80: "0,73,101", 90: "0,49,67", 100: "0,24,33" },
  // 60–100 ← Green.145–185
  green: { 0: "255,255,255", 5: "242,254,248", 10: "230,253,240", 15: "217,251,233", 20: "204,250,225", 30: "179,248,211", 40: "153,245,196", 50: "128,243,181", 60: "0,127,59", 70: "0,104,48", 80: "0,81,37", 90: "0,58,27", 100: "0,35,16" },
  // 60–100 ← Orange.120–160
  orange: { 0: "255,255,255", 5: "254,247,243", 10: "254,240,232", 15: "253,232,220", 20: "252,224,208", 30: "251,209,185", 40: "250,193,161", 50: "249,178,138", 60: "199,79,11", 70: "174,69,10", 80: "149,59,8", 90: "124,49,7", 100: "99,39,5" },
  // 60–100 ← Yellow.160–200
  yellow: { 0: "255,255,255", 5: "254,255,245", 10: "254,254,236", 15: "253,254,226", 20: "252,254,216", 30: "251,253,197", 40: "250,253,177", 50: "249,252,158", 60: "116,120,4", 70: "87,90,3", 80: "58,60,2", 90: "29,30,1", 100: "0,0,0" },
  // 60–100 ← Indigo.70–110
  indigo: { 0: "255,255,255", 5: "243,243,254", 10: "232,232,253", 15: "220,220,251", 20: "209,209,250", 30: "186,185,248", 40: "163,162,245", 50: "140,139,243", 60: "93,93,238", 70: "70,69,236", 80: "47,46,233", 90: "24,23,231", 100: "22,21,208" },
  // 60–100 ← Purple.100–140
  purple: { 0: "255,255,255", 5: "251,246,252", 10: "247,237,249", 15: "242,227,246", 20: "238,218,243", 30: "230,200,237", 40: "221,181,231", 50: "213,163,225", 60: "170,70,195", 70: "156,58,180", 80: "138,52,160", 90: "121,45,140", 100: "104,39,120" },
  // 60–100 ← Red.120–160
  red: { 0: "255,255,255", 5: "255,245,245", 10: "254,235,235", 15: "254,224,224", 20: "253,214,214", 30: "253,194,194", 40: "252,173,173", 50: "251,153,153", 60: "229,9,9", 70: "200,8,8", 80: "172,7,7", 90: "143,6,6", 100: "114,4,4" },
  // 60–100 ← Teal.135–175
  teal: { 0: "255,255,255", 5: "246,252,250", 10: "237,249,246", 15: "227,246,241", 20: "218,243,237", 30: "200,237,228", 40: "181,231,219", 50: "163,225,210", 60: "42,130,108", 70: "36,110,92", 80: "29,90,75", 90: "23,70,58", 100: "16,50,42" },
} as const;

/**
 * Flattens to CDS's spectrum keys. Values stay bare "r,g,b" triplets, as in
 * CDS's defaultTheme: CDS wraps them itself (Avatar's `rgb(var(--blue60))`,
 * Tag's `rgb(${theme.spectrum[...]})`), so a full `rgb(...)` here would be
 * invalid there.
 */
function spectrumColor(entries: typeof spectrum): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [hue, shades] of Object.entries(entries)) {
    for (const [step, rgb] of Object.entries(shades)) {
      out[`${hue}${step}`] = rgb;
    }
  }
  return out;
}

export const lightSpectrum = spectrumColor(spectrum);
export const darkSpectrum = spectrumColor(spectrum);

/**
 * Text.text-on-color (White.100 in both modes) for foregrounds CDS draws on a
 * colored fill: filled primary/positive/negative buttons, the Checkbox
 * checkmark, the selected Calendar day, DotCount, DotSymbol and the Avatar
 * initial. CDS uses fgInverse there, which suits its own light dark-mode
 * bgPrimary but not Finnomena's dark Navy.75. fgInverse cannot carry
 * text-on-color in dark: it must stay Text.text-inverse (black) for text on
 * bgInverse, which is white in dark (SegmentedTabs, the inverse Button). Dark
 * therefore uses fg, whose value (Text.text-primary, White.100) equals
 * text-on-color only by coincidence; re-check this if either token changes.
 * Applied through createTheme.ts's neonComponentConfig.
 */
export const onColorLabel = { light: "fgInverse", dark: "fg" } as const;

export const colorOverrides = {
  lightColor,
  darkColor,
  lightSpectrum,
  darkSpectrum,
};

export default colorOverrides;
