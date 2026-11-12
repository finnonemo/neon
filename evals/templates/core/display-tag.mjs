// tag → Core's Display tag at Hierarchy=Secondary: a tinted fill with its own ink and no stroke.
// Core's default variant is White Primary at Large; a status tag in a row is Secondary at Small,
// the cell the CDS tag was closest to. Which cell a tag takes by default is a question for Core.
import { padding } from './entries.mjs';

const container = (property) => ({ layer: 'Container', property });
const label = (property) => ({ layer: 'Container / Label', property });

// The Colors the Neon tag has a variant for (neutral, positive, warning, negative) and the Sizes
// it has a value for (sm, md, lg). Core's XSmall and its other Colors are not among them.
const COLORS = ['Navy', 'Green', 'Orange', 'Red'];
const SIZES = ['Small', 'Medium', 'Large'];

/** A measured Neon tag's cell of Core's Display tag: Navy and Small unless said. */
export function tagCell({ Color = 'Navy', Size = 'Small' } = {}) {
  if (!COLORS.includes(Color)) throw new Error(`The Neon tag has no variant for Core's ${Color}: it has ${COLORS.join(', ')}.`);
  if (!SIZES.includes(Size)) throw new Error(`The Neon tag has no size for Core's ${Size}: it has ${SIZES.join(', ')}.`);
  return { item: 'tag', cell: { Color, Hierarchy: 'Secondary', State: 'Enabled', Size } };
}

export default {
  set: 'Display tag',
  properties: {
    // A minimum: one line of the Label and the padding come to it exactly.
    h: container('minHeight'),
    pad: padding(container),
    radius: container('cornerRadius'),
    bg: container('fills.0'),
    // Secondary binds a stroke weight and no paint: nothing is drawn.
    border: { strokeOf: 'Container' },
    color: label('fills.0'),
    // Footnote, Subheadline and Body are Regular (docs/architecture.md in Core, Type).
    font: { ...label('textStyleId'), weight: 400 },
    opacity: { literal: 1 },
  },
};
