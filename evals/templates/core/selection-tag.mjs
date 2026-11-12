// toggle-group (and toggle, which it is built from) → Core's Selection tag in Secondary Navy.
// Core's default variant is White Primary; its doc calls Secondary the usual choice for filters
// beside their content and leaves Color to the category. Which Color a toggle takes is a
// question for Core.
import { padding } from './entries.mjs';

const container = (property) => ({ layer: 'Container', property });
const label = (property) => ({ layer: 'Container / Label', property });

// The Sizes the Neon toggle has a value for: lg, default and sm. Core's XSmall is not among them.
const SIZES = ['Large', 'Medium', 'Small'];

/** A measured Neon toggle's cell of Core's Selection tag: Medium, Enabled and not pressed unless said. */
export function selectionTagCell({ Size = 'Medium', State = 'Enabled', Selected = 'False' } = {}) {
  if (!SIZES.includes(Size)) throw new Error(`The Neon toggle has no size for Core's ${Size}: it has ${SIZES.join(', ')}.`);
  return { item: 'toggle-group', cell: { Color: 'Navy', Hierarchy: 'Secondary', State, Size, Selected } };
}

export default {
  set: 'Selection Tag',
  properties: {
    h: container('height'),
    pad: padding(container),
    radius: container('cornerRadius'),
    bg: container('fills.0'),
    // The ring is inside the tag: 1px, and 2px in the tag's ink when Selected.
    border: { strokeOf: 'Container' },
    color: label('fills.0'),
    // Body, Subheadline and Footnote are Regular (docs/architecture.md in Core, Type).
    font: { ...label('textStyleId'), weight: 400 },
    // Core binds no opacity: a Disabled tag dims by its disabled tokens.
    opacity: { literal: 1 },
  },
};
