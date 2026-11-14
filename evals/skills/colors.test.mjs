import test from 'node:test';
import assert from 'node:assert/strict';
import { contrast, matchToken, paletteTokens, parseColor, roleContrast, toRgb } from '../../scripts/lib/colors.mjs';

test('contrast reads hex, CDS triplets, rgb() and arrays alike', () => {
  for (const white of ['#ffffff', '255,255,255', 'rgb(255, 255, 255)', [255, 255, 255]]) {
    assert.equal(contrast(white, '#000000'), 21);
  }
  assert.deepEqual(toRgb('#01172b'), [1, 23, 43]);
  assert.equal(contrast('#ffffff', '#01172b').toFixed(2), '18.12');
});

test('roleContrast measures a role on each background in each mode, drawing what is not opaque over what is under it', () => {
  const colors = {
    light: { bg: 'rgb(255, 255, 255)', fg: 'rgba(0, 0, 0, 0.851)', fgPositive: 'rgb(0, 104, 48)', wash: 'rgb(230, 253, 240)', keyword: 'currentColor' },
    dark: { bg: 'rgb(0, 0, 0)', fg: 'rgb(255, 255, 255)', fgPositive: 'rgb(0, 208, 96)', wash: 'rgba(0, 231, 107, 0.149)', keyword: 'currentColor' },
  };
  const rows = roleContrast({ text: 'fgPositive', backgrounds: ['bg', 'wash', '#ffffff'], colors });
  assert.deepEqual(rows.map(row => [row.mode, row.background.name, row.over, row.ratio.toFixed(2)]), [
    ['light', 'bg', null, '6.95'],
    ['light', 'wash', null, '6.51'],
    ['light', '#ffffff', null, '6.95'],
    ['dark', 'bg', null, '10.19'],
    // 14.9% green over black is #002210.
    ['dark', 'wash', 'bg', contrast('#00d060', [0, 231 * 0.149, 107 * 0.149]).toFixed(2)],
    ['dark', '#ffffff', null, contrast('#00d060', '#ffffff').toFixed(2)],
  ]);
  assert.deepEqual(rows[4].text, { name: 'fgPositive', value: 'rgb(0, 208, 96)' });
  // Text that is not opaque is drawn over its background: 85.1% black on white is #262626.
  const [translucent] = roleContrast({ text: '--color-fg', backgrounds: ['bg'], colors: { light: colors.light } });
  assert.equal(translucent.ratio.toFixed(2), contrast([255 * 0.149, 255 * 0.149, 255 * 0.149], '#ffffff').toFixed(2));
  assert.throws(() => roleContrast({ text: 'fgMissing', backgrounds: ['bg'], colors }), /fgMissing is not a color role/);
  assert.throws(() => roleContrast({ text: 'fg', backgrounds: ['keyword'], colors }), /keyword is currentColor \(light\), which is not a color to measure/);
  assert.deepEqual(parseColor('#00000080'), { rgb: [0, 0, 0], alpha: 128 / 255 });
  assert.equal(parseColor('currentColor'), null);
});

// The research run that prompted this script called both Light Grey steps
// off-token (#61).
test('matchToken names exact palette tokens and the nearest one otherwise', () => {
  const tokens = paletteTokens();
  assert.deepEqual(matchToken('#E9EFF2', tokens), { exact: ['Light Grey/25'] });
  assert.deepEqual(matchToken('#bccfd9', tokens), { exact: ['Light Grey/75'] });
  assert.deepEqual(matchToken('#f5fb6b', tokens).nearest, { name: 'Yellow/75', value: '#f5fb6d', distance: 2 });
  assert.ok(tokens.every(token => !token.name.endsWith('A')), 'alpha tokens are excluded');
});
