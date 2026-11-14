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

/**
 * The box that covers `boxes` ({ x, y, width, height }), or null when none has an area: what an element with no
 * box of its own (display: contents) shows through its descendants.
 */
export function coveringBox(boxes) {
  const drawn = boxes.filter(({ width, height }) => width > 0 && height > 0);
  if (!drawn.length) return null;
  const x = Math.min(...drawn.map((box) => box.x));
  const y = Math.min(...drawn.map((box) => box.y));
  return { x, y, width: Math.max(...drawn.map((box) => box.x + box.width)) - x, height: Math.max(...drawn.map((box) => box.y + box.height)) - y };
}

/**
 * The part of `box` (page coordinates) inside a `viewport` ({ width, height }) scrolled to `scroll` ({ x, y }), as
 * { clip, cut }: the clip in viewport coordinates and whether the viewport cut the box. Null when none is in view.
 */
export function viewportClip(box, scroll, viewport) {
  const left = Math.max(0, box.x - scroll.x);
  const top = Math.max(0, box.y - scroll.y);
  const width = Math.min(viewport.width, box.x + box.width - scroll.x) - left;
  const height = Math.min(viewport.height, box.y + box.height - scroll.y) - top;
  if (width <= 0 || height <= 0) return null;
  return { clip: { x: left, y: top, width, height }, cut: width < box.width || height < box.height };
}
