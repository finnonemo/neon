// date-picker → Core's Date picker (core/components/date-picker.md), Single at Large. The set binds
// nothing but its two gaps: its field is Core's Date field, whose values it reads beside its own
// (date-field.json), and its calendar is Pickers' Compact style, which the calendar's table holds
// (date-and-time.mjs). Date field is Text field's Field with a calendar glyph last in it; the
// Neon field is Core's Large, and Medium and Small have no Neon prop.
import { fieldBox } from './text-field.mjs';

const inField = (layer) => (property) => ({ layer: `Container / Field / ${layer}`, property });
const input = inField('Text overflow / Input text');
const placeholder = inField('Text overflow / Placeholder text');
// Body is Regular (docs/architecture.md in Core, Type).
const REGULAR = 400;

/** A measured part of the Neon date picker's field in a cell of Core's Date field: Large, Enabled and filled unless said. */
export function dateFieldCell(part, { State = 'Enabled', filled = 'True' } = {}) {
  return { item: 'date-picker', part, cell: { 'Text filled': filled, State, Size: 'Large' } };
}

/** The Neon date picker in Core's Date picker, open: Single at Large. */
export const datePickerCell = (part) => ({ item: 'date-picker', part, cell: { Type: 'Single', Open: 'True', Size: 'Large' } });

const set = 'Date field';
export default {
  nested: ['date-field'],
  parts: {
    field: { set, properties: fieldBox('Container / Field') },
    value: { set, properties: { font: { ...input('textStyleId'), weight: REGULAR }, color: input('fills.0'), opacity: { literal: 1 } } },
    placeholder: { set, properties: { font: { ...placeholder('textStyleId'), weight: REGULAR }, color: placeholder('fills.0'), opacity: { literal: 1 } } },
    // The glyph's size is Core's Large icon step, which the snapshot states as a type token, not a box.
    icon: { set, properties: { color: inField('Calendar / Color')('fills.0') } },
    // The Date picker's own: the gap between its field and the calendar open under it. The 370 of
    // the calendar is a raw number in the doc.
    open: { set: 'Date picker', properties: { gap: { layer: 'Container', property: 'itemSpacing' }, w: { literal: 370 } } },
  },
};
