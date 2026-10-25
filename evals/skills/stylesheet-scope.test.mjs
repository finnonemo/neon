import test from 'node:test';
import assert from 'node:assert/strict';
import { unscopedSelectors } from './stylesheet-scope.mjs';

// Rules taken from the health-check rebuild samples recorded in README "CDS rebuild".
test('flags the bare element rules the fourth rebuild sample wrote', () => {
  const css = `
    body { margin: 0; }
    h2, h3, h4, h5, p { overflow-wrap: anywhere; }
    @media (max-width: 600px) { h1 { margin: 0 0 12px; } }
    * { box-sizing: border-box; }
    button { color: inherit; }
  `;
  assert.deepEqual(unscopedSelectors(css), ['body', 'h2', 'h3', 'h4', 'h5', 'p', 'h1', '*', 'button']);
});

test('flags class-led selectors that end on anonymous component markup', () => {
  const css = `
    .password-field > div { flex: 1; min-width: 0; }
    .phc-toolbar span:first-child { margin: 0; }
    .phc-row div { gap: 4px; }
  `;
  assert.deepEqual(unscopedSelectors(css), ['.password-field > div', '.phc-toolbar span:first-child', '.phc-row div']);
});

test('accepts class-led rules, including element selectors under an app class', () => {
  const css = `
    /* raw table owned by the app */
    .phc-table th, .phc-table td { padding: 8px; }
    .phc-column-body div[role="button"]:focus-visible { outline: 2px solid; }
    .phc-app :is(a, b) { color: inherit; }
    @media (min-width: 768px) { .phc-column { min-width: 320px; } }
    @keyframes pulse { from { opacity: 0; } 50% { opacity: 1; } }
    @font-face { font-family: X; src: url(x.woff2); }
    .phc-card { padding: 4px; &:hover { opacity: 0.9; } }
  `;
  assert.deepEqual(unscopedSelectors(css), []);
});
