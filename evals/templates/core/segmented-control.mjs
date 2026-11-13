// segmented-control → Core's Segmented control: the track, and each segment (_Segmented control item).
import { padding } from './entries.mjs';

// The track and a segment each bind their box on their own set's Container.
const container = (property) => ({ layer: 'Container', property });
const label = (property) => ({ layer: 'Container / Label', property });
const pad = padding(container);

/**
 * The Neon Segmented control's track in a cell of Core's: Medium and Enabled unless said.
 * Floating is False: the Neon item sits in the page and has no value for Core's track over scrolling content.
 */
export function segmentedCell({ Size = 'Medium', State = 'Enabled' } = {}) {
  return { item: 'segmented-control', part: 'track', cell: { Size, State, Floating: 'False' } };
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
        h: container('minHeight'),
        pad,
        radius: container('cornerRadius'),
        bg: container('fills.0'),
        // The whole control dims when Disabled, the one opacity Core binds here.
        opacity: { layer: '(root)', property: 'opacity', unbound: 1 },
      },
    },
    segment: {
      set: '_Segmented control item',
      properties: {
        h: container('minHeight'),
        pad,
        radius: container('cornerRadius'),
        bg: container('fills.0'),
        // The stroke is inside the segment at every state; a segment not chosen binds it Transparent.
        border: { strokeOf: 'Container' },
        color: label('fills.0'),
        // Subheadline and Body are Regular (docs/architecture.md in Core, Type).
        font: { ...label('textStyleId'), weight: 400 },
      },
    },
  },
};
