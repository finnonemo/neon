// separator → Core's Divider: one line, 1px of Border/border-subtle, with no stroke.
const line = (property) => ({ layer: 'Container / Line', property });

/** The Neon Separator in a cell of Core's Divider: no Inset unless said. */
export function dividerCell({ Inset = 'None' } = {}) {
  return { item: 'separator', cell: { Inset } };
}

export default {
  set: 'Divider',
  properties: {
    h: line('height'),
    bg: line('fills.0'),
    border: { strokeOf: 'Container / Line' },
  },
};
