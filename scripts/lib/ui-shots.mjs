// Pure helpers for ui-shots.mjs, kept apart so tests need no browser.

/** Scroll offsets for viewport-sized tiles covering a page, at most `max` tiles. */
export function tileOffsets(scrollHeight, viewportHeight, max) {
  const offsets = [];
  for (let y = 0; y < scrollHeight && offsets.length < max; y += viewportHeight) {
    // The last tile ends at the page bottom rather than past it.
    offsets.push(Math.max(0, Math.min(y, scrollHeight - viewportHeight)));
  }
  return [...new Set(offsets)];
}

/** "375x812,1440x900" → [[375, 812], [1440, 900]]. */
export function parseSizes(value) {
  return value.split(',').map((size) => {
    const match = /^(\d+)x(\d+)$/.exec(size.trim());
    if (!match) throw new Error(`Size "${size}" is not WIDTHxHEIGHT`);
    return [Number(match[1]), Number(match[2])];
  });
}
