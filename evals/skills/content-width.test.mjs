import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Immersive pages share one content column. theme.css carries its width and
// end margins by hand from the Immersive Layout tokens (#113 "Content width"),
// so a re-export that moves those numbers fails here until theme.css follows.
const css = readFileSync(new URL('../../theme/css/theme.css', import.meta.url), 'utf8');
const breakpoints = JSON.parse(readFileSync(new URL('../../theme/tokens/breakpoint.json', import.meta.url), 'utf8'));
const immersive = tier => breakpoints[tier]['Immersive Layout'];
const smallest = immersive('sm_320px');
const widest = immersive('xxxl_1440px');

const root = css.slice(css.indexOf(':root {'), css.indexOf('\n}\n', css.indexOf(':root {')));
const declared = (block, name) => block.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();

test('the content column is the Immersive Layout Content View max-width', () => {
  assert.equal(declared(root, 'layout-contentMaxWidth'), `${widest['Content View max-width'].value}px`);
});

test('end margins start at the smallest tier and widen from the 1440px tier', () => {
  assert.equal(declared(root, 'layout-endMargin'), `${smallest['End margins'].value}px`);
  const query = `@media (min-width: ${widest['Viewport min-width'].value}px)`;
  assert.ok(css.includes(query), `theme.css lacks ${query}`);
  const wide = css.slice(css.indexOf(query), css.indexOf('\n}\n', css.indexOf(query)));
  assert.equal(declared(wide, 'layout-endMargin'), `${widest['End margins'].value}px`);
});

test('the layout variables are marked provisional and cite the breakpoint export', () => {
  const comment = root.slice(0, root.indexOf('--layout-')).split('/*').at(-1);
  assert.match(comment, /PROVISIONAL/);
  assert.match(comment, /theme\/tokens\/breakpoint\.json/);
});
