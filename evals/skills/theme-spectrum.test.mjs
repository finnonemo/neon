import test from 'node:test';
import assert from 'node:assert/strict';
import { colorOverrides } from '../../theme/cds/color-overrides.ts';
import { contrast } from '../../scripts/lib/colors.mjs';

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

// Pairs CDS draws as text in @coinbase/cds-web@9.26.1: Tag puts blue/green/red
// 60, purple 80 and yellow 70 against step 0 (yellow high emphasis: 70 on 30).
// Avatar draws its initial on step 60 — white with Neon's on-color override,
// otherwise CDS's fgInverse. This checks 60/70/80 against 0 for every hue, so
// a hue CDS starts using at another of those steps is already covered.
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
