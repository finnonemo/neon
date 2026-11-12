// sonner → Core's Snackbar: the Container, its one text (Core's Description, sonner's title) and
// its Leading icon. The Description is Callout, which no Neon type role holds, so its font is not
// listed. The action is Core's Button, Tertiary Inverse at Medium, and follows the button table.
import { padding } from './entries.mjs';
import { buttonCell } from './button.mjs';

/** A measured part of Neon's toast in a cell of Core's Snackbar: no Leading and no Action unless said. */
export function snackbarCell(part, { leading = false, action = false } = {}) {
  return { item: 'sonner', part, cell: { Leading: leading ? 'Icon' : 'None', Status: 'Info', Action: action ? 'Button' : 'None' } };
}

/** The toast's action: Core's Button, Tertiary Inverse at Medium. */
export const snackbarAction = buttonCell('Tertiary', { Type: 'Inverse', Size: 'Medium' });

const container = (property) => ({ layer: 'Container', property });

const part = (properties) => ({ set: 'Snackbar', properties });

export default {
  parts: {
    container: part({ h: container('minHeight'), pad: padding(container), radius: container('cornerRadius'), bg: container('fills.0') }),
    text: part({ color: { layer: 'Container / Text / Description', property: 'fills.0' } }),
    icon: part({
      h: { layer: 'Container / Leading / Icon box', property: 'height' },
      w: { layer: 'Container / Leading / Icon box', property: 'width' },
      color: { layer: 'Container / Leading / Icon box / Icon', property: 'fills.0' },
    }),
  },
};
