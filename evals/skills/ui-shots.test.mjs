import test from 'node:test';
import assert from 'node:assert/strict';
import { parseClock, parseSizes, tileOffsets } from '../../scripts/lib/ui-shots.mjs';

test('tiles cover the page and the last tile ends at the bottom', () => {
  assert.deepEqual(tileOffsets(2000, 900, 10), [0, 900, 1100]);
});

test('tiles stop at the cap', () => {
  assert.deepEqual(tileOffsets(9000, 900, 3), [0, 900, 1800]);
});

test('a page shorter than the viewport is one tile', () => {
  assert.deepEqual(tileOffsets(500, 900, 4), [0]);
});

test('sizes parse and reject malformed values', () => {
  assert.deepEqual(parseSizes('375x812, 1440x900'), [[375, 812], [1440, 900]]);
  assert.throws(() => parseSizes('375'), /WIDTHxHEIGHT/);
});

test('a clock parses as local time, as the browser suite sets its own, and rejects what is not a time', () => {
  assert.equal(parseClock('2026-10-15T12:00').getTime(), new Date(2026, 9, 15, 12).getTime());
  assert.throws(() => parseClock('noon'), /not an ISO time/);
});
