// textarea → Core's Text area: the Text field's Field at 104 tall with 16px all round.
import { fieldBox } from './text-field.mjs';

const input = (property) => ({ layer: 'Container / Field / Text overflow / Input text', property });

/** A measured part of the Neon Textarea in a cell of Core's Text area: Large, Enabled and filled unless said. */
export function textAreaCell(part, { State = 'Enabled', Size = 'Large', filled = 'True' } = {}) {
  return { item: 'textarea', part, cell: { 'Text filled': filled, State, Size } };
}

const set = 'Text area';
export default {
  parts: {
    field: { set, properties: fieldBox('Container / Field') },
    // Body is Regular (docs/architecture.md in Core, Type).
    text: { set, properties: { font: { ...input('textStyleId'), weight: 400 }, color: input('fills.0'), opacity: { literal: 1 } } },
  },
};
