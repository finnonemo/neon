// accordion → Core's Accordion at Medium with no leading part: the header (Core's Main table
// cell), its Label and the chevron in its 24px box.
const set = '_Accordion header';
const ROW = 'Container / Main table cell';
const TEXT = `${ROW} / Label + Subtitle`;
const ICON = `${ROW} / Right content / Icon box`;
const states = ['Enabled', 'Active', 'Focus', 'Disabled'];

/** A measured part of a Neon accordion header in a cell of Core's _Accordion header: closed and Enabled unless said. */
export function accordionCell(part, { Expanded = false, State = 'Enabled' } = {}) {
  if (!states.includes(State)) throw new Error(`Neon's accordion has no ${State} state: a header is ${states.join(', ')}.`);
  return { item: 'accordion', part, cell: { Size: 'Medium', Leading: 'None', Expanded: Expanded ? 'True' : 'False', State } };
}

export default {
  parts: {
    header: {
      set,
      properties: {
        // Core binds minimums, 48 for the row and 56 for the Label block. The doc's Size axis gives
        // the result: a Medium header with a one-line title is 56 (14 + 24 + 14, raised to 56).
        h: { literal: 56 },
        // The row pads its sides and the Label block inside it pads above and below.
        pad: [{ layer: TEXT, property: 'paddingTop' }, { layer: ROW, property: 'paddingRight' }, { layer: TEXT, property: 'paddingBottom' }, { layer: ROW, property: 'paddingLeft' }],
        radius: { layer: ROW, property: 'cornerRadius' },
        bg: { layer: ROW, property: 'fills.0' },
        // The stroke is inside the row: Transparent at rest, Focus/focus on keyboard focus.
        border: { strokeOf: ROW },
      },
    },
    // Core's Headline is Medium.
    title: { set, properties: { font: { layer: `${TEXT} / Label`, property: 'textStyleId', weight: 500 }, color: { layer: `${TEXT} / Label`, property: 'fills.0' } } },
    chevron: {
      set,
      properties: { h: { layer: ICON, property: 'height' }, w: { layer: ICON, property: 'width' }, color: { layer: `${ICON} / Icon`, property: 'fills.0' } },
    },
  },
};
