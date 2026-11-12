import test from 'node:test';
import assert from 'node:assert/strict';
import { asRecorded, compare, pick } from '../templates/measure.mjs';

// radius reads only the top-left corner, which is 0 on a sheet pinned top or
// left in both targets; radii compares all four corners, ±1px each.
test('radii compares every corner within a pixel', () => {
  const measured = { radius: 0, radii: [0, 32, 32, 0] };
  assert.deepEqual(pick(measured, ['radii']), { radii: [0, 32, 32, 0] });
  assert.deepEqual(compare({ radii: [0, 31, 33, 0] }, { radii: [0, 32, 32, 0] }), []);
  assert.deepEqual(compare({ radii: [0, 0, 0, 0] }, { radii: [0, 32, 32, 0] }), ['radii 0,0,0,0 ≠ 0,32,32,0']);
  assert.deepEqual(compare({ radii: [32, 32, 0, 0] }, { radii: [0, 0, 32, 32] }), ['radii 32,32,0,0 ≠ 0,0,32,32']);
});

// A type size or line height is a set value, not a rounded measurement: one pixel
// off is another value (label1 at 15 where the baseline holds 14).
test('a type size and a line height compare exactly', () => {
  const baseline = { font: { size: 14, lineHeight: 20, weight: 600 } };
  assert.deepEqual(compare({ font: { size: 14, lineHeight: 20, weight: 600 } }, baseline), []);
  assert.deepEqual(compare({ font: { size: 15, lineHeight: 21, weight: 600 } }, baseline), ['font.size 15 ≠ 14', 'font.lineHeight 21 ≠ 20']);
});

// A recorded difference in a box measurement (w, h, radius, a gap) is held to the
// same pixel as the baseline: macOS and Linux round a text's width a pixel apart,
// so "w 45 ≠ 43" recorded on one is "w 46 ≠ 43" on the other. A set value (type
// size, line height, weight, opacity) is held to the recorded number itself.
test('a recorded box measurement holds within a pixel of its number, and no further', () => {
  const recorded = ['suffixText: w 45 ≠ 43', 'pill: h 40 ≠ 38', 'pill: radius 20 ≠ 19', 'suffixText: font.lineHeight 24 ≠ 20', 'gap sheet→sheetTitle: -59 ≠ -54', 'title: color rgb(1, 2, 3) ≠ rgb(4, 5, 6)'];
  assert.deepEqual(asRecorded(['suffixText: w 46 ≠ 43', 'pill: h 41 ≠ 38', 'pill: radius 21 ≠ 19', 'suffixText: font.lineHeight 24 ≠ 20', 'gap sheet→sheetTitle: -60 ≠ -54', 'title: color rgb(1, 2, 3) ≠ rgb(4, 5, 6)'], recorded), recorded);
  assert.deepEqual(asRecorded(['suffixText: w 47 ≠ 43'], recorded), ['suffixText: w 47 ≠ 43']);
  assert.deepEqual(asRecorded(['suffixText: w 46 ≠ 44'], recorded), ['suffixText: w 46 ≠ 44'], 'another baseline number is another difference');
  assert.deepEqual(asRecorded(['prefixText: w 46 ≠ 43'], recorded), ['prefixText: w 46 ≠ 43'], 'an unrecorded element stays a problem');
  assert.deepEqual(asRecorded(['title: color rgb(1, 2, 4) ≠ rgb(4, 5, 6)'], recorded), ['title: color rgb(1, 2, 4) ≠ rgb(4, 5, 6)'], 'a color is not a pixel count');
});

test('a recorded set value holds to its own number', () => {
  const recorded = ['label: font.size 15 ≠ 14', 'label: font.lineHeight 24 ≠ 22', 'label: font.weight 600 ≠ 601', 'disabled: opacity 0.5 ≠ 1'];
  for (const problem of ['label: font.size 16 ≠ 14', 'label: font.lineHeight 25 ≠ 22', 'label: font.weight 599 ≠ 601', 'disabled: opacity 0 ≠ 1']) {
    assert.deepEqual(asRecorded([problem], recorded), [problem]);
  }
});
