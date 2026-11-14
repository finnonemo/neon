import { readFileSync } from 'node:fs';

// Accepts [r, g, b], "#rrggbb", "r,g,b" (CDS spectrum triplets) or "rgb(r, g, b)".
export function toRgb(value) {
  if (Array.isArray(value)) return value;
  if (value.startsWith('#')) return [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16));
  return value.match(/[\d.]+/g).slice(0, 3).map(Number);
}

const luminance = rgb => toRgb(rgb).map(v => v / 255)
  .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);

/** `#RRGGBBAA` as CSS writes a color: `rgb(1, 23, 43)`, or `rgba(0, 0, 0, 0.851)` when it is not opaque. */
export function cssColor(hex) {
  const rgb = toRgb(hex).join(', ');
  const alpha = parseInt(hex.slice(7, 9) || 'ff', 16);
  return alpha === 255 ? `rgb(${rgb})` : `rgba(${rgb}, ${Math.round((alpha / 255) * 1000) / 1000})`;
}

// WCAG 2 contrast ratio of two opaque colors.
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** A color as CSS or a token writes it (`rgb()`, `rgba()`, `#rrggbb`, `#rrggbbaa`) as { rgb, alpha }; null for anything else, such as a keyword. */
export function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (hex) return { rgb: toRgb(value), alpha: hex[2] ? parseInt(hex[2], 16) / 255 : 1 };
  const css = value.match(/^rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\s*\)$/);
  return css ? { rgb: css.slice(1, 4).map(Number), alpha: css[4] === undefined ? 1 : Number(css[4]) } : null;
}

// A color drawn over an opaque one, as the opaque color the eye gets.
const over = ({ rgb, alpha }, under) => rgb.map((channel, index) => channel * alpha + under[index] * (1 - alpha));

/**
 * The contrast of `text` on each of `backgrounds` in each mode of `colors` ({ mode: { role: value } }, as
 * adapterColors gives it). Each is a color role's name or a color written out, which is the same in every mode.
 * A background that is not opaque is drawn over the mode's `bg`, and text that is not opaque over its background.
 * Returns one row per mode and background: { mode, text, background, over, ratio }, the first two as { name, value }.
 */
export function roleContrast({ text, backgrounds, colors }) {
  return Object.entries(colors).flatMap(([mode, roles]) => {
    const read = name => {
      const value = parseColor(name) ? name : roles[name.replace(/^--color-/, '')];
      if (value === undefined) throw new Error(`${name} is not a color role, nor a color written as #rrggbb.`);
      const color = parseColor(value);
      if (!color) throw new Error(`${name} is ${value} (${mode}), which is not a color to measure.`);
      return { name, value, color };
    };
    const page = read('bg').color;
    if (page.alpha !== 1) throw new Error(`bg is not opaque (${mode}), so nothing says what a translucent color is drawn over.`);
    const ink = read(text);
    return backgrounds.map(name => {
      const background = read(name);
      const surface = over(background.color, page.rgb);
      return {
        mode,
        text: { name: ink.name, value: ink.value },
        background: { name: background.name, value: background.value },
        over: background.color.alpha === 1 ? null : 'bg',
        ratio: contrast(over(ink.color, surface), surface),
      };
    });
  });
}

// Opaque palette tokens from theme/tokens/colors.json as { name: "Family/step", value }.
// Alpha tokens (Black/50A …) are left out: a page color is never matched to one.
export function paletteTokens(path = new URL('../../theme/tokens/colors.json', import.meta.url)) {
  const colors = JSON.parse(readFileSync(path, 'utf8'));
  return Object.entries(colors).flatMap(([family, steps]) => Object.entries(steps)
    .filter(([, token]) => /^#[0-9a-f]{6}$/i.test(token.value))
    .map(([step, token]) => ({ name: `${family}/${step}`, value: token.value.toLowerCase() })));
}

// Every token with exactly this value, else the nearest one by RGB distance.
export function matchToken(hex, tokens) {
  const value = hex.toLowerCase();
  const exact = tokens.filter(token => token.value === value).map(token => token.name);
  if (exact.length) return { exact };
  const rgb = toRgb(value);
  const distance = token => Math.hypot(...toRgb(token.value).map((v, i) => v - rgb[i]));
  const nearest = tokens.reduce((best, token) => distance(token) < distance(best) ? token : best);
  return { nearest: { ...nearest, distance: Math.round(distance(nearest) * 10) / 10 } };
}
