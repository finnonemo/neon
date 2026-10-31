import test from 'node:test';
import assert from 'node:assert/strict';
import { contrast, matchToken, paletteTokens, toRgb } from '../../scripts/lib/colors.mjs';

test('contrast reads hex, CDS triplets, rgb() and arrays alike', () => {
  for (const white of ['#ffffff', '255,255,255', 'rgb(255, 255, 255)', [255, 255, 255]]) {
    assert.equal(contrast(white, '#000000'), 21);
  }
  assert.deepEqual(toRgb('#01172b'), [1, 23, 43]);
  assert.equal(contrast('#ffffff', '#01172b').toFixed(2), '18.12');
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
