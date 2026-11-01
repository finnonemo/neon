import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CSS_FILE, SETS, STEPS, loadImmersiveThemes, renderImmersiveCss, resolveColor,
} from '../../theme/scripts/generate-immersive-themes.mjs';

const source = loadImmersiveThemes();

test('immersive-themes.css is regenerated from immersive-themes.json', () => {
  assert.equal(readFileSync(CSS_FILE, 'utf8'), renderImmersiveCss(source),
    'run node theme/scripts/generate-immersive-themes.mjs');
});

const luminance = hex => hex.slice(1, 7).match(/../g).map(v => parseInt(v, 16) / 255)
  .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => {
  const [hi, lo] = [a, b].map(ref => luminance(resolveColor(source.colors, ref))).sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// Guideline 4.6/4.7: type only in White or Navy; colors only from the
// primary palette (Navy, Light Grey, Yellow, White) and its tints.
const PRIMARY = ['Navy', 'Light Grey', 'Yellow', 'White'];
const TEXT = ['White.100', 'Navy.100'];

for (const [name, theme] of Object.entries(source.themes)) {
  const pairs = [
    ['text on canvas', theme.text, theme.canvas],
    ...SETS.filter(set => theme[set]).flatMap(set => STEPS.map(step =>
      [`${set}.${step}`, theme[set][step].fg, theme[set][step].bg])),
    ['action label', theme.action.fg, theme.action.bg],
  ];

  test(`${name}: text is White or Navy and every color is primary`, () => {
    for (const [label, fg, bg] of pairs) {
      assert.ok(TEXT.includes(fg), `${name} ${label} text ${fg}`);
      assert.ok(PRIMARY.includes(bg.slice(0, bg.lastIndexOf('.'))), `${name} ${label} surface ${bg}`);
    }
  });

  test(`${name}: every text pair reaches 4.5:1 and the action 3:1 on canvas`, () => {
    for (const [label, fg, bg] of pairs) {
      const ratio = contrast(fg, bg);
      assert.ok(ratio >= 4.5, `${name} ${label}: ${fg} on ${bg} ${ratio.toFixed(2)}`);
    }
    const action = contrast(theme.action.bg, theme.canvas);
    assert.ok(action >= 3, `${name} action ${theme.action.bg} on ${theme.canvas}: ${action.toFixed(2)}`);
  });
}

// Guideline 4.4/4.5: secondary colours pair with Navy or White text and
// are shared by every theme.
test('secondary steps pair with White or Navy text at 4.5:1', () => {
  const SECONDARY = ['Green', 'Blue', 'Purple', 'Red', 'Orange'];
  for (const [family, set] of Object.entries(source.secondary)) {
    for (const step of STEPS) {
      const { fg, bg } = set[step];
      assert.ok(TEXT.includes(fg), `${family}.${step} text ${fg}`);
      assert.ok(SECONDARY.includes(bg.slice(0, bg.lastIndexOf('.'))), `${family}.${step} surface ${bg}`);
      const ratio = contrast(fg, bg);
      assert.ok(ratio >= 4.5, `${family}.${step}: ${fg} on ${bg} ${ratio.toFixed(2)}`);
    }
  }
});
