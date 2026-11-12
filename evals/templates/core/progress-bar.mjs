// progress → Core's Progress bar: the Track and the Indicator in it. Neon's Progress is the bar
// alone; Core's Label, Value and Helper text are a screen's own text.
const track = (property) => ({ layer: 'Container / Track', property });
const indicator = (property) => ({ layer: 'Container / Track / Indicator', property });

/** The Neon Progress in a cell of Core's Progress bar: Active, half full, Medium unless said. */
export function progressCell(part, { Status = 'Active', Progress = '50%', Size = 'Medium' } = {}) {
  return { item: 'progress', part, cell: { Status, Progress, Alignment: 'Default', Size } };
}

export default {
  parts: {
    track: {
      set: 'Progress bar',
      properties: { h: track('height'), radius: track('cornerRadius'), bg: track('fills.0') },
    },
    indicator: {
      set: 'Progress bar',
      properties: { h: indicator('height'), radius: indicator('cornerRadius'), bg: indicator('fills.0') },
    },
  },
};
