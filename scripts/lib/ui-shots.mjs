// Pure helpers for ui-shots.mjs and before-after.mjs, kept apart so tests need no browser.

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

/** "2026-10-15T12:00" → the Date a page's clock is fixed at; a time with no offset is local, as the browser suite's is. */
export function parseClock(value) {
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) throw new Error(`Clock "${value}" is not an ISO time, such as 2026-10-15T12:00`);
  return time;
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

/**
 * The PNGs of two ui-shots.mjs runs paired by file name, in the order a reader counts them (tile2 before
 * tile10): [{ name, before, after }], false for the run that did not write the file. `match` keeps the
 * names that contain it.
 */
export function pairShots(before, after, match = '') {
  const names = [...new Set([...before, ...after])].filter((name) => name.endsWith('.png') && name.includes(match));
  return names.sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).map((name) => ({ name, before: before.includes(name), after: after.includes(name) }));
}

const escaped = (text) => text.replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]);

/**
 * The page before-after.mjs photographs: a `main` grid of two columns as wide as their widest picture,
 * one row per pair, its file name over the before and the after picture, each at most `width` wide. A
 * row gives each side its image `src`, or null where that run wrote none.
 */
export function montageHtml(rows, { width = 720, labels = ['Before', 'After'] } = {}) {
  const side = (src, label) => (src ? `<img src="${escaped(src)}" alt="${escaped(label)}">` : `<p>${escaped(label)}: not captured</p>`);
  return `<!doctype html><meta charset="utf-8"><style>
body { margin: 0; }
main { display: inline-grid; grid-template-columns: max-content max-content; gap: 4px 24px; align-items: start; padding: 16px; background: #f4f4f5; color: #18181b; font: 13px/1.4 system-ui, sans-serif; }
b { font-weight: 600; }
h2 { grid-column: 1 / -1; margin: 12px 0 0; font: inherit; color: #52525b; }
img { display: block; max-width: ${width}px; outline: 1px solid #d4d4d8; }
p { margin: 0; color: #71717a; }
</style><main>${labels.map((label) => `<b>${escaped(label)}</b>`).join('')}${rows.map(({ name, before, after }) => `<h2>${escaped(name)}</h2>${side(before, labels[0])}${side(after, labels[1])}`).join('')}</main>`;
}
