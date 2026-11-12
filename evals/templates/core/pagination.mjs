// pagination → Core's Pagination, Type=Numbered at Medium: the bar, a page item's 36px Container
// and the ellipsis. Previous and Next are Buttons and follow the button item.
import { padding } from './entries.mjs';

const item = '_Pagination item';
const states = ['Enabled', 'Hover', 'Pressed', 'Focus', 'Disabled'];

/** A measured part of Neon's pagination: the bar, or a page in a cell of Core's _Pagination item (not selected and Enabled unless said). */
export function paginationCell(part, { Selected = false, State = 'Enabled' } = {}) {
  if (part === 'bar') return { item: 'pagination', part, cell: { Type: 'Numbered', Size: 'Medium', State: 'Default' } };
  if (!states.includes(State)) throw new Error(`Neon's pagination has no ${State} state: a page is ${states.join(', ')}.`);
  return { item: 'pagination', part, cell: { Kind: part === 'ellipsis' ? 'Ellipsis' : 'Page', Selected: Selected ? 'True' : 'False', State, Size: 'Medium' } };
}

export default {
  parts: {
    bar: {
      set: 'Pagination',
      properties: {
        h: { layer: 'Container', property: 'minHeight' },
        // A side Core binds no padding to has none.
        pad: padding((property) => ({ layer: 'Container', property, unbound: 0 })),
        bg: { layer: 'Container', property: 'fills.0' },
      },
    },
    page: {
      set: item,
      properties: {
        h: { layer: 'Container', property: 'minHeight' },
        w: { layer: 'Container', property: 'minWidth' },
        pad: padding((property) => ({ layer: 'Container', property })),
        radius: { layer: 'Container', property: 'cornerRadius' },
        bg: { layer: 'Container', property: 'fills.0' },
        color: { layer: 'Container / Label', property: 'fills.0' },
      },
    },
    ellipsis: { set: item, properties: { color: { layer: 'Container / Icon', property: 'fills.0' } } },
  },
};
