// segmented-control → Core's Segmented control: the track, and each segment (_Segmented control item).
const track = (property) => ({ layer: 'Container', property });
const label = (property) => ({ layer: 'Container / Label', property });
const pad = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].map(track);

/** The Neon Segmented control's track in a cell of Core's: Medium and Enabled unless said. */
export function segmentedCell({ Size = 'Medium', State = 'Enabled' } = {}) {
  return { item: 'segmented-control', part: 'track', cell: { Size, State } };
}

/** One segment in a cell of Core's _Segmented control item: Medium, Enabled and not chosen unless said. */
export function segmentCell({ Selected = 'False', State = 'Enabled', Size = 'Medium' } = {}) {
  return { item: 'segmented-control', part: 'segment', cell: { Selected, State, Size } };
}

export default {
  parts: {
    track: {
      set: 'Segmented control',
      properties: {
        h: track('minHeight'),
        pad,
        radius: track('cornerRadius'),
        bg: track('fills.0'),
        // The whole control dims when Disabled, the one opacity Core binds here.
        opacity: { layer: '(root)', property: 'opacity', unbound: 1 },
      },
    },
    segment: {
      set: '_Segmented control item',
      properties: {
        h: track('minHeight'),
        pad,
        radius: track('cornerRadius'),
        bg: track('fills.0'),
        // The stroke is inside the segment at every state; a segment not chosen binds it Transparent.
        border: { layer: 'Container', weight: 'strokeWeight', paint: 'strokes.0' },
        color: label('fills.0'),
        // Subheadline and Body are Regular (docs/architecture.md in Core, Type).
        font: { ...label('textStyleId'), weight: 400 },
      },
    },
  },
};
