// tabs → Core's Tabs, Style=Underline at Medium, the tabs as wide as their labels (Width=Intrinsic):
// a tab, its Label, the Line under the selected tab and the Track the tabs sit on.
import { padding } from './entries.mjs';

const CONTENT = 'Container / Content';
const bar = { Width: 'Intrinsic', Style: 'Underline', Size: 'Medium', Type: 'Text + Icon' };
const states = ['Enabled', 'Active', 'Focus', 'Disabled'];

/** A measured part of Neon's tabs in a cell of Core's _Tab: not selected and Enabled unless said. The Track is the bar's. */
export function tabCell(part, { Selected = false, State = 'Enabled' } = {}) {
  if (part === 'track') return { item: 'tabs', part, cell: bar };
  if (!states.includes(State)) throw new Error(`Neon's tabs have no ${State} state: a tab is ${states.join(', ')}.`);
  return { item: 'tabs', part, cell: { ...bar, Selected: Selected ? 'True' : 'False', State } };
}

export default {
  parts: {
    tab: {
      set: '_Tab',
      properties: {
        // The Hit target: a one-line tab is 12 + 24 + 12.
        h: { layer: '(root)', property: 'minHeight' },
        pad: padding((property) => ({ layer: CONTENT, property })),
        bg: { layer: 'Container', property: 'fills.0' },
        // The stroke is inside the tab: Transparent at rest, Focus/focus on keyboard focus.
        border: { strokeOf: CONTENT },
        opacity: { literal: 1 },
      },
    },
    label: {
      set: '_Tab',
      properties: {
        font: { layer: `${CONTENT} / Label`, property: 'textStyleId', weight: 400 },
        color: { layer: `${CONTENT} / Label`, property: 'fills.0' },
      },
    },
    line: { set: '_Tab', properties: { h: { layer: 'Container / Line', property: 'height' }, bg: { layer: 'Container / Line', property: 'fills.0' } } },
    track: { set: 'Tabs', properties: { h: { layer: 'Container / Track', property: 'height' }, bg: { layer: 'Container / Track', property: 'fills.0' } } },
  },
};
