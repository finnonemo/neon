// toggle-group (and toggle, which it is built from) → Core's Selection tag in Secondary Navy.
// Core has ten Colors and three Hierarchies and names no default; Neon takes the neutral one.
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
    pad: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].map(container),
    radius: container('cornerRadius'),
    bg: container('fills.0'),
    // The ring is inside the tag: 1px, and 2px in the tag's ink when Selected.
    border: { layer: 'Container', weight: 'strokeWeight', paint: 'strokes.0' },
    color: label('fills.0'),
    // Body, Subheadline and Footnote are Regular (docs/architecture.md in Core, Type).
    font: { ...label('textStyleId'), weight: 400 },
    // Core binds no opacity: a Disabled tag dims by its disabled tokens.
    opacity: { literal: 1 },
  },
};
