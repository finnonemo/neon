// list-row → Core's List item at Medium with a custom leading part (an Avatar) and a Subtitle:
// the row (Core's Main table cell), the text beside the artwork, its Title and Subtitle, and the
// Checkmark a selected row shows.
import { padding } from './entries.mjs';

const set = 'List item';
const ROW = 'Container / Main table cell';
const TEXT = `${ROW} / Label + Subtitle`;
const row = (property) => ({ layer: ROW, property });
const text = (property) => ({ layer: TEXT, property });
const at = (layer) => ({ layer: `${ROW} / ${layer}`, property: 'fills.0' });
// A side Core binds no padding to has none.
const sides = (entry) => padding((property) => ({ ...entry(property), unbound: 0 }));

/** A measured part of a Neon list row in a cell of Core's List item: Enabled unless said. */
export function listCell(part, { State = 'Enabled' } = {}) {
  return { item: 'list-row', part, cell: { Size: 'Medium', Leading: 'Custom', Trailing: 'None', State } };
}

export default {
  parts: {
    row: {
      set,
      properties: {
        // Core binds minimums, 48 for the row and 56 for the text. The doc's Size table gives the
        // result: a Medium row with a Subtitle is two lines, 72 (14 + 24 + 20 + 14).
        h: { literal: 72 },
        pad: sides(row),
        radius: row('cornerRadius'),
        bg: row('fills.0'),
        // The stroke is inside the row: Transparent at rest, Focus/focus on keyboard focus.
        border: { strokeOf: ROW },
      },
    },
    text: { set, properties: { pad: sides(text) } },
    // The snapshot binds the Title no text style; Core's doc gives it Headings/Headline, which is Medium.
    title: { set, properties: { font: { textStyle: 'Headline', weight: 500 }, color: at('Label + Subtitle / Title / Label') } },
    subtitle: {
      set,
      properties: {
        font: { layer: `${TEXT} / Subtitle row / Subtitle`, property: 'textStyleId', weight: 400 },
        color: at('Label + Subtitle / Subtitle row / Subtitle'),
      },
    },
    checkmark: { set, properties: { color: at('Right content / Checkmark') } },
  },
};
