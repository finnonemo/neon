// button → Core's Button: which binding each measured property reads.
// A hugging button's width has no Core variable in the snapshot, so it is not
// listed and stays on the CDS baseline.
const container = (property) => ({ layer: 'Container', property });
const label = (property) => ({ layer: 'Container / Label', property });

// The Sizes the Neon Button has a value for. Core's Expressive sizes (a fixed 256 width) are not among them.
const SIZES = ['Large', 'Medium', 'Small', 'XSmall'];

/** A measured Neon Button's cell of Core's Button: Large, Default and Enabled unless said. */
export function buttonCell(Hierarchy, { Type = 'Default', Size = 'Large', State = 'Enabled' } = {}) {
  if (!SIZES.includes(Size)) throw new Error(`The Neon Button has no size for Core's ${Size}: it has ${SIZES.join(', ')}.`);
  return { item: 'button', cell: { Hierarchy, Type, Size, State } };
}

export default {
  set: 'Button',
  properties: {
    h: container('minHeight'),
    pad: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].map(container),
    // Core's Radius is at least half the height at every Size: a Capsule.
    radius: { ...container('cornerRadius'), atMostHalf: 'h' },
    // Tertiary has no fill until Hover.
    bg: { ...container('fills.0'), unbound: 'rgba(0, 0, 0, 0)' },
    color: label('fills.0'),
    // The snapshot's text styles hold no weight. Core's rule is that a button label is Medium
    // (docs/architecture.md in Core, Type); stated here until the snapshot carries it.
    font: { ...label('textStyleId'), weight: 500 },
    // Core binds no opacity: a Disabled button dims by its tokens' own alpha (button.md, Theme tokens).
    opacity: { literal: 1 },
  },
};
