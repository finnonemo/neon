// Entries the property tables share.

/** What measure.mjs reads where nothing is painted. */
export const NO_PAINT = 'rgba(0, 0, 0, 0)';

/** A layer's four paddings in measure.mjs's order (top, right, bottom, left): `entry` makes one property's entry. */
export const padding = (entry) => ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].map(entry);
