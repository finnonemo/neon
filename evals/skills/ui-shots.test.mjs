import test from 'node:test';
import assert from 'node:assert/strict';
import { coveringBox, parseSizes, tileOffsets, viewportClip } from '../../scripts/lib/ui-shots.mjs';

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

// An element with no box of its own (#297): every data-measure hook in the eval fixtures is display: contents.
test('a wrapper with no box is the area its drawn descendants cover', () => {
  const boxes = [{ x: 40, y: 300, width: 24, height: 24 }, { x: 72, y: 302, width: 120, height: 20 }, { x: 0, y: 0, width: 0, height: 18 }];
  assert.deepEqual(coveringBox(boxes), { x: 40, y: 300, width: 152, height: 24 });
  assert.equal(coveringBox([{ x: 10, y: 10, width: 0, height: 0 }]), null, 'nothing drawn is nothing to capture');
  assert.equal(coveringBox([]), null);
});

test('the covered area is clipped to the viewport, and says when the viewport cut it', () => {
  const box = { x: 40, y: 1300, width: 152, height: 24 };
  assert.deepEqual(viewportClip(box, { x: 0, y: 1300 }, { width: 375, height: 812 }), { clip: { x: 40, y: 0, width: 152, height: 24 }, cut: false });
  assert.deepEqual(viewportClip(box, { x: 0, y: 600 }, { width: 375, height: 712 }), { clip: { x: 40, y: 700, width: 152, height: 12 }, cut: true }, 'a page too short to scroll the box to the top');
  assert.deepEqual(viewportClip({ ...box, width: 900 }, { x: 0, y: 1300 }, { width: 375, height: 812 }), { clip: { x: 40, y: 0, width: 335, height: 24 }, cut: true });
  assert.equal(viewportClip(box, { x: 0, y: 0 }, { width: 375, height: 812 }), null, 'out of view');
});
