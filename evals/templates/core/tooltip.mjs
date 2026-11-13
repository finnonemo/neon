// tooltip → Core's Tooltip: the tip, _Tooltip item. Its Surface and the Label in it; the caret
// is _Toggletip caret, which has no values of its own in the snapshot.
import { padding } from './entries.mjs';

const sizes = { sm: 'Small', default: 'Medium', lg: 'Large' };

/** A measured part of Neon's tooltip, the surface or the label, in a cell of Core's _Tooltip item: above its trigger, centered, at Medium unless said. */
export function tooltipCell(part, { size = 'default' } = {}) {
  if (!sizes[size]) throw new Error(`Neon's tooltip has no ${size} size: it has ${Object.keys(sizes).join(', ')}.`);
  return { item: 'tooltip', part, cell: { Position: 'Top', Alignment: 'Center', Size: sizes[size] } };
}

const surface = (property) => ({ layer: 'Container / Surface', property });
const label = (property) => ({ layer: 'Container / Surface / Label', property });

export default {
  parts: {
    surface: {
      set: '_Tooltip item',
      properties: { pad: padding(surface), radius: surface('cornerRadius'), bg: surface('fills.0') },
    },
    label: {
      set: '_Tooltip item',
      properties: { font: label('textStyleId'), color: label('fills.0') },
    },
  },
};
