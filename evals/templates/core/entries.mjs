// Entries the property tables share.

/** What measure.mjs reads where nothing is painted. */
export const NO_PAINT = 'rgba(0, 0, 0, 0)';

/** A Theme token, Scale step or text style a Counterpart's doc names for a part (a doc table's entry). */
export const named = (doc) => ({ doc });

/** A raw number a Counterpart's doc states. */
export const raw = (literal) => ({ literal });

/** No stroke: what measure.mjs reads as a border where none is drawn. */
export const NO_STROKE = raw({ width: 0, color: NO_PAINT });

/** A layer's four paddings in measure.mjs's order (top, right, bottom, left): `entry` makes one property's entry. */
export const padding = (entry) => ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].map(entry);
