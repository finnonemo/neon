import test from 'node:test';
import assert from 'node:assert/strict';
import { colorOverrides } from '../../theme/cds/color-overrides.ts';

// CDS wraps spectrum steps in rgb() itself (media/Avatar.css and tag/Tag.js
// in @coinbase/cds-web@9.26.1), so each value must be a bare "r,g,b" triplet
// like its defaultTheme, not a complete rgb() color.
test('spectrum overrides are bare r,g,b triplets', () => {
  for (const field of ['lightSpectrum', 'darkSpectrum']) {
    for (const [step, value] of Object.entries(colorOverrides[field])) {
      assert.match(value, /^\d{1,3},\d{1,3},\d{1,3}$/, `${field}.${step}`);
    }
  }
});
