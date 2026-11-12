// spinner → Core's Progress circle, Layout=Inline and Indeterminate: the Ring. Its Track is a
// full circle and its Indicator a quarter arc, both stroked inside the Ring.
const ring = (property) => ({ layer: 'Container / Ring', property });
const stroke = (layer, property) => ({ layer: `Container / Ring / ${layer}`, property });

/** The Neon Spinner in a cell of Core's Progress circle: XSmall unless said. */
export function spinnerCell({ Size = 'XSmall' } = {}) {
  return { item: 'spinner', cell: { Layout: 'Inline', Size, Status: 'Active', Progress: 'Indeterminate' } };
}

export default {
  set: 'Progress circle',
  properties: {
    h: ring('height'),
    w: ring('width'),
    // A circle: half the Ring, however large.
    radius: { ...ring('height'), atMostHalf: 'h' },
    // measure.mjs reads the top border, the Track; color is the arc's.
    border: { strokeOf: 'Container / Ring / Track' },
    color: stroke('Indicator', 'strokes.0'),
  },
};
