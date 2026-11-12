// select → Core's Select: the Text field's Field with a Value and a Chevron. Active is the open
// state; Focus is focused and closed (select.md, States).
import { fieldBox } from './text-field.mjs';

const value = (property) => ({ layer: 'Container / Field / Text overflow / Value text', property });

/** A measured part of the Neon Select's trigger in a cell of Core's Select: Large and Enabled unless said. */
export function selectCell(part, { State = 'Enabled' } = {}) {
  return { item: 'select', part, cell: { State, Size: 'Large' } };
}

const set = 'Select';
export default {
  parts: {
    field: { set, properties: fieldBox('Container / Field') },
    // Body is Regular (docs/architecture.md in Core, Type).
    value: { set, properties: { font: { ...value('textStyleId'), weight: 400 }, color: value('fills.0'), opacity: { literal: 1 } } },
    chevron: { set, properties: { color: { layer: 'Container / Field / Chevron / Color', property: 'fills.0' } } },
  },
};
