// checkbox → Core's Checkbox (Type=Inset): the 24px Box, the glyph in it and the Value beside it.
import { NO_PAINT } from './entries.mjs';

const BOX = 'Container / Icon + Value / Checkbox margin / Box';
const box = (property) => ({ layer: BOX, property });
const glyph = (property) => ({ layer: `${BOX} / Icon`, property });

/** A measured part of the Neon Checkbox in a cell of Core's Checkbox: Enabled and unchecked unless said. */
export function checkboxCell(part, { State = 'Enabled', Selection = 'Unchecked' } = {}) {
  return { item: 'checkbox', part, cell: { Type: 'Inset', Alignment: 'Left', State, Selection } };
}

const set = 'Checkbox';
export default {
  parts: {
    box: {
      set,
      properties: {
        h: box('height'),
        w: box('width'),
        // Core binds the Box Box/Default Radius and a stroke weight it never paints: the edge it
        // draws is the Focus ring's, which is square.
        radius: { layer: `${BOX} / Focus ring`, property: 'cornerRadius' },
        // The Box paints nothing: its glyph is the indicator.
        bg: { ...box('fills.0'), unbound: NO_PAINT },
        border: { strokeOf: BOX },
        opacity: { literal: 1 },
      },
    },
    glyph: {
      set,
      properties: {
        // Icon/Large is 17px type. Core's square, square-check and square-minus are 448 of a
        // 512 em wide and as tall: 14.875px.
        h: { literal: 14.875 },
        w: { literal: 14.875 },
        color: glyph('fills.0'),
        opacity: { literal: 1 },
      },
    },
    value: {
      set,
      properties: {
        font: { textStyle: 'Body', weight: 400 },
        color: { layer: 'Container / Icon + Value / Text / Value', property: 'fills.0' },
        opacity: { literal: 1 },
      },
    },
  },
};
