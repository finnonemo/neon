// alert-dialog and dialog → Core's Alert at iOS=False (core/components/alert.md), which the
// snapshot holds as a doc alone: a 300px card padded 16 (spacing-05) on Layer/layer-01 with radius-lg corners,
// over the Miscellaneous/overlay scrim. Its "Title and Message" block pads 8, 8, 24, 8
// (spacing-03, spacing-06) round a Headline Title and a Body Message, both Text/text-primary.
// The card's width is a raw number in the doc. dialog reads the same parts.
import { named, raw } from './entries.mjs';

const text = (style) => ({ font: named(style), color: named('Text/text-primary') });

/** A measured part of Neon's alert-dialog, or of its dialog, in Core's Alert. */
export const alertCell = (part, item = 'alert-dialog') => ({ item, part });

export default {
  doc: true,
  parts: {
    overlay: { properties: { bg: named('Miscellaneous/overlay') } },
    card: { properties: { w: raw(300), pad: Array(4).fill(named('Spacing/spacing-05')), radius: named('Radius/radius-lg'), bg: named('Layer/layer-01') } },
    text: { properties: { pad: [named('Spacing/spacing-03'), named('Spacing/spacing-03'), named('Spacing/spacing-06'), named('Spacing/spacing-03')] } },
    title: { properties: text('Headings/Headline') },
    message: { properties: text('Body/Body') },
  },
};
