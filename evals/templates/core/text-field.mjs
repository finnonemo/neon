// input, label, field and input-group → Core's Text field: which binding each measured property
// reads. The Neon field is Core's Large; Medium and Small have no Neon prop.
import { padding } from './entries.mjs';

const inLayer = (layer) => (property) => ({ layer, property });
const title = inLayer('Container / Label + Character count / Title');
const input = inLayer('Container / Field / Text overflow / Input text');
const placeholder = inLayer('Container / Field / Text overflow / Placeholder text');
const helper = inLayer('Container / Detail / Helper Text');
const error = inLayer('Container / Detail / Error message');

// The snapshot's text styles hold no weight. Core's rule (docs/architecture.md in Core, Type):
// Headline takes Medium, everything else Regular.
const MEDIUM = 500;
const REGULAR = 400;

/** The Field box as every Core field draws it (Text field, Text area, Select): `layer` is its Field layer. */
export const fieldBox = (layer) => ({
  h: { layer, property: 'minHeight' },
  pad: padding(inLayer(layer)),
  radius: { layer, property: 'cornerRadius' },
  bg: { layer, property: 'fills.0' },
  // The stroke is inside the Field, and a state draws it: Enabled binds a weight and no paint.
  border: { strokeOf: layer },
  // Core binds no opacity: a Disabled field dims by its disabled tokens.
  opacity: { literal: 1 },
});

/** A measured part of a Neon field in a cell of Core's Text field: Large, Enabled and filled unless said. */
export function fieldCell(item, part, { State = 'Enabled', filled = 'True' } = {}) {
  return { item, part, cell: { 'Text filled': filled, State, Size: 'Large' } };
}

const set = 'Text field';
export default {
  parts: {
    field: { set, properties: fieldBox('Container / Field') },
    text: { set, properties: { font: { ...input('textStyleId'), weight: REGULAR }, color: input('fills.0'), opacity: { literal: 1 } } },
    placeholder: { set, properties: { font: { ...placeholder('textStyleId'), weight: REGULAR }, color: placeholder('fills.0') } },
    title: { set, properties: { font: { ...title('textStyleId'), weight: MEDIUM }, color: title('fills.0'), opacity: { literal: 1 } } },
    helper: { set, properties: { font: { ...helper('textStyleId'), weight: REGULAR }, color: helper('fills.0') } },
    error: { set, properties: { font: { ...error('textStyleId'), weight: REGULAR }, color: error('fills.0') } },
    // The glyph's size is Core's Medium icon step, which the snapshot states as a type token, not a box.
    errorIcon: { set, properties: { color: { layer: 'Container / Detail / circle-exclamation / Color', property: 'fills.0' } } },
    // The unit takes the input text's style; its ink is _Unit suffix's own, outside this Counterpart.
    unit: { set, properties: { font: { layer: 'Container / Field / _Unit suffix / Container / Unit', property: 'textStyleId', weight: REGULAR } } },
  },
};
