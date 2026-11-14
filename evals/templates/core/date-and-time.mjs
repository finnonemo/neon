// calendar → Core's Date and time at iOS=False (core/components/date-and-time.md), a doc alone: the
// Date part of its Pickers set. The Header is hit-target tall, padded 8 at its left, with the month
// in Headline and Text/text-primary and two 48px Icon buttons with no fill. A weekday is Footnote in
// Text/text-secondary. A _Week is hit-target tall; a _Day is a hit-target square whose number is
// Title 3 in Text/text-primary, Link/link-primary on today, Text/text-inverse on a picked day and
// Text/text-disabled, at full opacity, on a disabled one. The Mark is 36 round (Radius/Round on a
// 36px box: 18) and has no fill until the day is picked, when it is Layer/layer-selected-inverse.
// Today's dot is 4 × 4 in Link/link-primary. A range's band is control-small tall in
// Miscellaneous/highlight: all 48 of a day in the range, the inner 24 of each end.
// The 8, the 48 of an arrow and of the band, the 36, the 24 and the 4 are raw numbers in the doc.
// The arrows' ink and states are Icon button's, which this doc does not name.
import { NO_PAINT, named, raw } from './entries.mjs';

const hitTarget = named('Sizing/hit-target');
const number = named('Headings/Title 3');
const mark = { h: raw(36), w: raw(36), radius: raw(18) };
const band = { h: named('Sizing/control-small'), bg: named('Miscellaneous/highlight') };

/** A measured part of Neon's calendar in Core's Date and time. */
export const pickersCell = (part) => ({ item: 'calendar', part });

export default {
  doc: true,
  parts: {
    header: { properties: { h: hitTarget, pad: [raw(0), raw(0), raw(0), raw(8)] } },
    month: { properties: { font: named('Headings/Headline'), color: named('Text/text-primary') } },
    arrow: { properties: { h: raw(48), w: raw(48), bg: raw(NO_PAINT) } },
    weekday: { properties: { font: named('Utility/Footnote'), color: named('Text/text-secondary') } },
    week: { properties: { h: hitTarget } },
    day: { properties: { h: hitTarget, w: hitTarget, font: number, color: named('Text/text-primary'), opacity: raw(1) } },
    today: { properties: { font: number, color: named('Link/link-primary') } },
    selected: { properties: { h: hitTarget, w: hitTarget, font: number, color: named('Text/text-inverse') } },
    disabled: { properties: { font: number, color: named('Text/text-disabled'), opacity: raw(1) } },
    mark: { properties: { ...mark, bg: raw(NO_PAINT) } },
    selectedMark: { properties: { ...mark, bg: named('Layer/layer-selected-inverse') } },
    dot: { properties: { h: raw(4), w: raw(4), bg: named('Link/link-primary') } },
    band: { properties: { ...band, w: raw(48) } },
    bandEnd: { properties: { ...band, w: raw(24) } },
  },
};
