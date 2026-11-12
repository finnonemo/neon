// table → Core's Table at Medium: the header cell on the Header row's fill, the body row and a
// text cell. Core's row pads 8 a side (its Margins) and each cell 8 more; an HTML table has no
// row padding, so the first and last cells carry the row's 8.
import { padding } from './entries.mjs';

const container = (property) => ({ layer: 'Container', property });
const cells = { set: 'Table row', layer: 'Cells', property: 'minHeight' };
const row = (Type) => ({ Type, Size: 'Medium', Selection: 'None', Expansion: 'None', State: 'Enabled' });

const CELLS = {
  headerCell: { Size: 'Medium', Alignment: 'Left', Sorted: 'None', State: 'Enabled' },
  bodyRow: row('Body'),
  bodyCell: { Type: 'Text', Size: 'Medium', Alignment: 'Left', 'Vertical alignment': 'Center', State: 'Enabled' },
  // A cell that holds a control pads 4 above and below, so a 48px control keeps the row at 56.
  controlCell: { Type: 'Button', Size: 'Medium', Alignment: 'Left', 'Vertical alignment': 'Center', State: 'Enabled' },
};

/** A measured part of a Neon table (`headerCell`, `bodyRow`, `bodyCell`, `controlCell`) in its cell of Core's Table, at Medium. */
export function tableCell(part) {
  if (!CELLS[part]) throw new Error(`The Neon table has no measured part ${part}: it has ${Object.keys(CELLS).join(', ')}.`);
  return { item: 'table', part, cell: CELLS[part] };
}

export default {
  parts: {
    headerCell: {
      set: 'Table header cell',
      properties: {
        h: container('minHeight'),
        pad: padding(container),
        // The Header row's fill, which Neon paints on each header cell.
        bg: { set: 'Table row', at: row('Header'), layer: '(root)', property: 'fills.0' },
        // Footnote Strong: Core's bold, which Neon draws at 600.
        font: { layer: 'Container / Label', property: 'textStyleId', weight: 600 },
        color: { layer: 'Container / Label', property: 'fills.0' },
      },
    },
    bodyRow: { set: 'Table row', properties: { h: cells } },
    controlCell: { set: 'Table cell', properties: { h: container('minHeight'), pad: padding(container) } },
    bodyCell: {
      set: 'Table cell',
      properties: {
        h: container('minHeight'),
        pad: padding(container),
        font: { layer: 'Container / Text / Label', property: 'textStyleId', weight: 400 },
        color: { layer: 'Container / Text / Label', property: 'fills.0' },
      },
    },
  },
};
