// dropdown-menu → Core's Menu at iOS=False (core/components/menu.md), a doc alone: a 238px
// surface padded 10 above and below on Layer/layer-01 with radius-md corners and no stroke. A row
// (_Menu Items) is at least 48px tall, a radius-round pill padded 8 at its right (spacing-03) and
// 6 at its left, its Label Body in Text/text-primary padded spacing-04 above and below: Neon's
// item is one element, so it carries both paddings. Danger is Text/text-negative and Disabled
// Text/text-disabled at full opacity. The Section Title is Footnote in Text/text-secondary,
// padded 4, 8, 8, 8 (32px tall); the Separator's line is 1px of Border/border-subtle. The
// width, the 10 and the 6 are raw numbers in the doc.
import { NO_STROKE, named, raw } from './entries.mjs';

const body = named('Body/Body');

/** A measured part of Neon's dropdown-menu in Core's Menu. */
export const menuCell = (part) => ({ item: 'dropdown-menu', part });

export default {
  doc: true,
  parts: {
    surface: { properties: { w: raw(238), pad: [raw(10), raw(0), raw(10), raw(0)], radius: named('Radius/radius-md'), bg: named('Layer/layer-01'), border: NO_STROKE } },
    item: {
      properties: {
        h: raw(48),
        pad: [named('Spacing/spacing-04'), named('Spacing/spacing-03'), named('Spacing/spacing-04'), raw(6)],
        radius: { ...named('Radius/radius-round'), atMostHalf: 'h' },
        font: body,
        color: named('Text/text-primary'),
      },
    },
    danger: { properties: { font: body, color: named('Text/text-negative') } },
    disabled: { properties: { color: named('Text/text-disabled'), opacity: raw(1) } },
    sectionTitle: { properties: { h: raw(32), pad: [named('Spacing/spacing-02'), named('Spacing/spacing-03'), named('Spacing/spacing-03'), named('Spacing/spacing-03')], font: named('Utility/Footnote'), color: named('Text/text-secondary') } },
    separator: { properties: { h: raw(1), bg: named('Border/border-subtle') } },
  },
};
