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

const luminance = value => value.split(',').map(Number).map(v => v / 255)
  .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// Pairs CDS draws as text in @coinbase/cds-web@9.26.1: Tag's low/high
// emphasis puts 60/70/80 against step 0 (yellow high: 70 on 30), and Avatar
// draws its white initial on step 60.
test('spectrum steps CDS draws text with reach 4.5:1', () => {
  for (const field of ['lightSpectrum', 'darkSpectrum']) {
    const spectrum = colorOverrides[field];
    const hues = new Set(Object.keys(spectrum).map(key => key.replace(/\d+$/, '')));
    for (const hue of hues) {
      for (const step of [60, 70, 80]) {
        const ratio = contrast(spectrum[`${hue}${step}`], spectrum[`${hue}0`]);
        assert.ok(ratio >= 4.5, `${field}.${hue}${step} on ${hue}0: ${ratio.toFixed(2)}`);
      }
    }
    const yellowTag = contrast(spectrum.yellow70, spectrum.yellow30);
    assert.ok(yellowTag >= 4.5, `${field}.yellow70 on yellow30: ${yellowTag.toFixed(2)}`);
  }
});
