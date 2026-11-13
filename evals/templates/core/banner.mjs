// alert → Core's In-line banner, Hierarchy=Primary with an Icon and no action: the box, its icon,
// the Title and the Description. Core's border is the fill's own color in light and clear in dark,
// so the alert draws none and the table lists none. The snapshot binds no text style to the Title
// or the Description: the doc names Subheadline for both.
import { padding } from './entries.mjs';

const statuses = { informational: 'Info', success: 'Success', warning: 'Warning', error: 'Error' };

/** A measured part of Neon's alert in its variant's cell of Core's In-line banner. */
export function bannerCell(part, variant = 'informational') {
  if (!statuses[variant]) throw new Error(`Core's In-line banner has no Status for the ${variant} alert: it has ${Object.keys(statuses).join(', ')}.`);
  return { item: 'alert', part, cell: { Status: statuses[variant], Hierarchy: 'Primary', Artwork: 'Icon', Action: 'None' } };
}

const container = (property) => ({ layer: 'Container', property });
const part = (properties) => ({ set: 'In-line banner', properties });
const text = (layer) => part({ font: { textStyle: 'Subheadline' }, color: { layer: `Container / Title and Description / ${layer}`, property: 'fills.0' } });

export default {
  parts: {
    box: part({ h: container('minHeight'), pad: padding(container), radius: container('cornerRadius'), bg: container('fills.0') }),
    icon: part({ color: { layer: 'Container / Leading Icon', property: 'fills.0' } }),
    title: text('Title'),
    message: text('Description'),
  },
};
