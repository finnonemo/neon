// radio-group → Core's Radio, Type=Inset: the glyph in a 24 × 24 Box with the Value beside it.
const NO_PAINT = 'rgba(0, 0, 0, 0)';
const BOX = 'Container / Icon + Value / Radio button margin / Box';
const box = (property) => ({ layer: BOX, property });
const glyph = (property) => ({ layer: `${BOX} / Icon`, property });

/** A measured part of a Neon radio in a cell of Core's Radio: Inset, Enabled and Unselected unless said. */
export function radioCell(part, { State = 'Enabled', Selection = 'Unselected' } = {}) {
  return { item: 'radio-group', part, cell: { Type: 'Inset', Alignment: 'Left', State, Selection } };
}

const set = 'Radio';
export default {
  parts: {
    // The Box holds the glyph and paints nothing itself.
    box: {
      set,
      properties: {
        h: box('height'),
        w: box('width'),
        radius: { ...box('cornerRadius'), atMostHalf: 'h' },
        bg: { ...box('fills.0'), unbound: NO_PAINT },
        border: { layer: BOX, weight: 'strokeWeight', paint: 'strokes.0' },
        opacity: { literal: 1 },
      },
    },
    // circle and circle-dot at Core's Large icon size, a 17px glyph (icon.md, Sizes).
    glyph: { set, properties: { h: { literal: 17 }, w: { literal: 17 }, color: glyph('fills.0'), opacity: { literal: 1 } } },
    // The snapshot binds the Value no text style; radio.md gives it Body, and Body is Regular.
    value: { set, properties: { font: { textStyle: 'Body', weight: 400 }, color: { layer: 'Container / Icon + Value / Text / Value', property: 'fills.0' }, opacity: { literal: 1 } } },
  },
};
