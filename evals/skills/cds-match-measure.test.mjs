import test from 'node:test';
import assert from 'node:assert/strict';
import { compare, pick } from '../templates/measure.mjs';

// radius reads only the top-left corner, which is 0 on a sheet pinned top or
// left in both targets; radii compares all four corners, ±1px each.
test('radii compares every corner within a pixel', () => {
  const measured = { radius: 0, radii: [0, 32, 32, 0] };
  assert.deepEqual(pick(measured, ['radii']), { radii: [0, 32, 32, 0] });
  assert.deepEqual(compare({ radii: [0, 31, 33, 0] }, { radii: [0, 32, 32, 0] }), []);
  assert.deepEqual(compare({ radii: [0, 0, 0, 0] }, { radii: [0, 32, 32, 0] }), ['radii 0,0,0,0 ≠ 0,32,32,0']);
  assert.deepEqual(compare({ radii: [32, 32, 0, 0] }, { radii: [0, 0, 32, 32] }), ['radii 32,32,0,0 ≠ 0,0,32,32']);
});
