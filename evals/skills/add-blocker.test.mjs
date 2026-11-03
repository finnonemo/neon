import test from 'node:test';
import assert from 'node:assert/strict';
import { dependencyPath } from '../../scripts/add-blocker.mjs';

// child → its open blockers, as the tracker reports blocked_by.
const tracker = (edges) => async (number) => edges[number] ?? [];

test('an edge that closes a loop names the path back to the child', async () => {
  // #123 ← #122, #124 ← #123, #127 ← #124: blocking #122 on #127 closes the loop.
  const blockedBy = tracker({ 123: [122], 124: [123], 127: [124] });
  assert.deepEqual(await dependencyPath(127, 122, blockedBy), [127, 124, 123, 122]);
});

test('an edge into an unrelated chain is allowed', async () => {
  const blockedBy = tracker({ 123: [122], 124: [123], 127: [124, 116] });
  assert.equal(await dependencyPath(127, 130, blockedBy), null);
  assert.equal(await dependencyPath(116, 122, blockedBy), null);
});

test('a ticket cannot block itself', async () => {
  assert.deepEqual(await dependencyPath(122, 122, tracker({})), [122]);
});

test('a diamond is walked once per ticket', async () => {
  const asked = [];
  const blockedBy = async (number) => { asked.push(number); return { 4: [2, 3], 2: [1], 3: [1] }[number] ?? []; };
  assert.equal(await dependencyPath(4, 5, blockedBy), null);
  assert.deepEqual(asked.sort(), [1, 2, 3, 4]);
});
