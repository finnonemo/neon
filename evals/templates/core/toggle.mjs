// switch → Core's Toggle, Style=Toggle only: the track and its thumb. The track's size is the
// nested _Toggle Item's and the thumb's the nested _Toggle Switch's; their fills are the Toggle's.
import { padding } from './entries.mjs';

const TRACK = 'Container / _Toggle Item / Container';
const item = (property) => ({ set: '_Toggle Item', at: { Size: 'Medium', State: 'Enabled' }, layer: 'Container', property });
const thumb = (property) => ({ set: '_Toggle Switch', at: { Disabled: 'False', Pressed: 'False' }, layer: '(root)', property });

/** A measured part of the Neon Switch in a cell of Core's Toggle: Enabled and off unless said. */
export function toggleCell(part, { State = 'Enabled', Toggled = 'False' } = {}) {
  return { item: 'switch', part, cell: { Style: 'Toggle only', State, Toggled } };
}

const set = 'Toggle';
export default {
  parts: {
    track: {
      set,
      properties: {
        // Core binds the track no height: it hugs the 18px thumb in 3px of padding. toggle.md's
        // notes say a 28 row, the iOS track's height: a question for Core.
        h: { literal: 24 },
        w: item('width'),
        pad: padding(item),
        radius: { ...item('cornerRadius'), atMostHalf: 'h' },
        bg: { layer: TRACK, property: 'fills.0' },
        // Core binds no opacity: a Disabled toggle dims by its disabled tokens.
        opacity: { literal: 1 },
      },
    },
    thumb: {
      set,
      properties: {
        h: thumb('height'),
        w: thumb('width'),
        radius: { ...thumb('cornerRadius'), atMostHalf: 'h' },
        bg: { layer: `${TRACK} / _Toggle Switch`, property: 'fills.0' },
        // Core binds the thumb no stroke.
        border: { strokeOf: `${TRACK} / _Toggle Switch` },
        opacity: { literal: 1 },
      },
    },
  },
};
