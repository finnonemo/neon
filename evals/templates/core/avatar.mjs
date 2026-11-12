// avatar → Core's Avatar with Artwork=Initials in Color=Default: the round Container and the
// Label in it. Neon's default is Core's Small (36) and lg its Medium (48).
const container = (property) => ({ layer: 'Container', property });
const label = (property) => ({ layer: 'Container / Label', property });
const set = 'Avatar';

// The Sizes the Neon avatar has a value for: default and lg.
const SIZES = ['Small', 'Medium'];
// The snapshot's text styles hold no weight. Core's doc: Small is Headline's Medium. From Medium
// up the Label is Title 3 in Core's Strong, an emphasis no Neon type role carries: that Label is
// held to Title 3's size and line height, and its weight is a question for Core.
const LABELS = { Small: 'label', Medium: 'strongLabel' };

/** A measured Neon avatar's cell of Core's Avatar: its `circle`, or its `label`. Small unless said. */
export function avatarCell(part, { Size = 'Small' } = {}) {
  if (!SIZES.includes(Size)) throw new Error(`The Neon avatar has no size for Core's ${Size}: it has ${SIZES.join(', ')}.`);
  return { item: 'avatar', part: part === 'label' ? LABELS[Size] : part, cell: { Size, Artwork: 'Initials', Color: 'Default' } };
}

const text = (weight) => ({ set, properties: { font: { ...label('textStyleId'), ...weight }, color: label('fills.0') } });

export default {
  parts: {
    circle: {
      set,
      properties: {
        h: container('height'),
        w: container('width'),
        // A circle: Core binds a radius larger than any Size.
        radius: { ...container('cornerRadius'), atMostHalf: 'h' },
        bg: container('fills.0'),
      },
    },
    label: text({ weight: 500 }),
    strongLabel: text(),
  },
};
