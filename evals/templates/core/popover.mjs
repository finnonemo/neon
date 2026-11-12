// popover → Core's Popover at iOS=False (core/components/popover.md), a doc alone: a 352px
// surface on Layer/layer-01 with radius-md corners and a 1px border-subtle stroke inside, its
// Content padded spacing-05. The width and the stroke's weight are raw numbers in the doc.
const named = (doc) => ({ doc });

/** Neon's popover surface in Core's Popover. */
export const popoverCell = () => ({ item: 'popover' });

export default {
  doc: true,
  properties: {
    w: { literal: 352 },
    pad: Array(4).fill(named('Spacing/spacing-05')),
    radius: named('Radius/radius-md'),
    bg: named('Layer/layer-01'),
    border: { doc: 'Border/border-subtle', strokeWidth: 1 },
  },
};
