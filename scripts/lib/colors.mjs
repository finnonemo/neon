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

// WCAG 2 contrast ratio of two opaque colors.
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
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
