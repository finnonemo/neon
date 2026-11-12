// sheet → Core's Sheet at iOS=False (core/components/sheet.md), a doc alone: Uber's Modal sheet,
// flush with the bottom on Layer/layer-01 with radius-lg on its top corners only, padded
// spacing-05 above, with no stroke, over the Miscellaneous/overlay Dimming Layer. Its Grabber is
// a 48 by 4 bar in Border/border-subtle; the doc rounds it `Radius/Round`, which a 4px bar caps
// at 2. The surface part is the bottom sheet: Core has no sheet on another side.
import { NO_STROKE, named, raw } from './entries.mjs';

const none = raw(0);
const corner = named('Radius/radius-lg');

/** A measured part of Neon's sheet in Core's Sheet. */
export const sheetCell = (part) => ({ item: 'sheet', part });

export default {
  doc: true,
  parts: {
    overlay: { properties: { bg: named('Miscellaneous/overlay') } },
    surface: { properties: { pad: [named('Spacing/spacing-05'), none, none, none], radii: [corner, corner, none, none], bg: named('Layer/layer-01'), border: NO_STROKE } },
    grabber: { properties: { h: raw(4), w: raw(48), radius: raw(2), bg: named('Border/border-subtle'), opacity: raw(1) } },
  },
};
